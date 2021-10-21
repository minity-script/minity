const { mergeAndConcat:merge } =require('merge-anything');
const assert = require("assert");
const { resolve, dirname } = require("path");
const { statSync, mkdirSync, writeFileSync } = require("fs");

const Result = exports.Result = class Result {
  constructor() {
    this.namespaces = {};
    this.constants = {};
    this.addNamespace("minecraft","Internal");
    this.main = this.addNamespace("zzz_mcl","Main");
  }
  addNamespace(ns,kind="Custom") {
    let namespace = this.namespaces[ns];
    if (!namespace) {
      namespace = this.namespaces[ns] = new ResultNamespace[kind](this, { ns })
    }
    return this.namespaces[ns];
  }
  getNamespace(ns) {
    this.addNamespace(ns);
    return this.addNamespace(ns);
  }
  addConstant(value) {
    const name = "--mcl--const-" + value;
    if (!this.constants[value]) {
      const objective = "--mcl--const";
      const id = name + " " + objective;
      this.constants[value] = {
        name,
        objective,
        id,
        declare: "scoreboard players set " + id + " " + value
      }
    }
    return this.constants[value];
  }
  macroExists(ns,...args) {
    return this.namespaces[ns]?.macroExists(...args)
  }
  getMacro(ns,name) {
    return this.namespaces[ns].macros[name]
  }
  addFunction(ns, ...args) {
    return this.getNamespace(ns).addFunction(...args);
  }
  addAnonFunction(ns, ...args) {
    return this.getNamespace(ns).addAnonFunction(...args);
  }
  addJson(ns, ...args) {
    return this.getNamespace(ns).addJson(...args);
  }
  get declare() {
    return [
      ...Object.values(this.constants).map(it => it.declare)
    ]
  }

  get files() {
    return [
      ...Object.values(this.namespaces).flatMap(it => it.files)
    ];
  }
}


class ResultNamespace {
  constructor(result, { ns }) {
    this.result = result;
    this.ns = ns;
    this.objectives = {};
    this.jsons = {};
    //this.addObjective(`--${ns}--vars`, "dummy")
    this.functions = {};
    this.macros = {}
  }
  addObjective(objective, criterion = "dummy") {
    return this.objectives[objective] = {
      objective,
      criterion,
      id: objective + " " + criterion,
      get declare() {
        return "scoreboard objectives add " + this.id;
      }
    }
  }
  get main() {
    return this.result.main;
  }
  macroExists = (name) => {
    return(!!this.macros[name])
  }
  addMacro = (name,props) => {
    assert(!this.functions[name], "duplicate function " + name)
    assert(!this.macros[name], "duplicate function " + name)
    this.macros[name]={ name, ...props };
  }
  addFunction(self, name, content) {
    const fn = new ResultFunction(this, { self, name, content })
    assert(!this.functions[fn.name], "duplicate function " + fn.resloc)
    assert(!this.macros[fn.name], "duplicate function " + fn.resloc)
    return this.functions[fn.name] = fn;
  }
  addAnonFunction(self, content,prefix="") {
    const id = prefix+"_"+Math.random().toString(36).substring(2);
    return this.main.addFunction(self,[this.ns,id],content);
  }
  addJson(name, obj) {
    let id = [].concat(name).join("/");
    const file = this.jsons[id] ??= new ResultJson(this, { name });
    file.merge(obj);
    return file;
  }
  get files() {
    return [
      ...Object.values(this.jsons),
      ...Object.values(this.functions)
    ]
  }
}

ResultNamespace.Internal = ResultNamespace

ResultNamespace.Custom = class ResultNamespaceCustom extends ResultNamespace {
  constructor(result,{...rest}) {
    super(result,rest);
    this.addObjective(`--${this.ns}--vars`, "dummy");
    this.addAnonFunction("",()=>[
      `data modify storage zzz_mcl:${this.ns} stack set value []`,
      ... Object.values(this.objectives).map(it=>it.declare)
    ],"objectives").addTag("minecraft","load");
  }
}

ResultNamespace.Main = class ResultNamespaceCustom extends ResultNamespace.Custom {
  constructor(result,{...rest}) {
    super(result,{...rest});
    this.addAnonFunction("",()=>[
      ... Object.values(this.result.constants).map(it=>it.declare)
    ],"constants").addTag("minecraft","load");
  }
  get main() {
    return this;
  }
}


class ResultFile {
  constructor(namespace, { name, ext, content }) {
    this.namespace = namespace;
    this.ns = namespace.ns
    this.parts = [].concat(name);
    this.ext = ext;
    this._content = content;
  }

  get content() {
    if (typeof this._content==='function') return this._content();
    else return this._content;
  }

  get text() {
    return "";
  }
  get name() {
    return this.parts.join("/")
  }
  get resloc() {
    return this.ns + ":" + this.name
  }
  get dest() {
    return ["data", this.ns, ...this.parts].join("/") + this.ext;
  }

  write(to) {
    const path = resolve(to, this.dest);
    const entry = statSync(path, { throwIfNoEntry: false })
    const text = entry ? this.overwrite(path) : this.text;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  }
  overwrite(path) {
    throw new Error("duplicate file "+ path);
  }
}

class ResultFunction extends ResultFile {
  constructor(namespace, { self, ...rest }) {
    super(namespace, { ext: ".mcfunction", ...rest });
    this.self = self;
    //console.log("=".repeat(60),"\n"+this.resloc,"\n"+this.text,"\n"+"-".repeat(60))
  }
    
  get text() {
    return this.content.filter(Boolean).map(line=>{
      if (Array.isArray(line)) {
        return line.map(part=>{
          if (part == Symbol.for("callSelf")) {
            return "function "+this.self;
          }
          return part;
        }).join("");
      }
      return line;
    }).join("\n");
  }

  addTag(ns, tag) {
    this.namespace.result.addJson(ns, ["tags", "functions", tag], {
      values: [this.resloc]
    })
    return this;
  }

  get dest() {
    return ["data", this.ns, "functions", ...this.parts].join("/") + this.ext;
  }
}

class ResultJson extends ResultFile {
  constructor(namespace, { content = {}, ...rest }) {
    super(namespace, { ext: ".json", content, ...rest });
  }
  get text() {
    return JSON.stringify(this.content,null,2);
  }
  merge(obj) {
    this._content = merge(this.content, obj);
  }
  overwrite(path) {
    return JSON.stringify(merge(require(path), this.content),null,2);
  }
}