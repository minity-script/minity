const assert = require("assert");
let mclang = require("./mclang.js");
const { Result } = require("./Result");
const { TreeNode } = require("./TreeNode");
const { Nbt } = require("./Nbt");
const { resolve, dirname } = require("path");
const { isNbt, toNbt, toSnbt, toJson } = Nbt;


const Frame = exports.Frame =
  class Frame extends Function {
    constructor() {
      mclang = require("./index.js")
      super()
      this.proxy = new Proxy(this, {
        apply: (target, thisArg, args) => target.transform(...args)
      })
      return this.proxy;
    }
    get T() {
      return this.transform;
    }

    O = node => {
      if (node === null) return "";
      return this.T(node);
    }
    importFile = (file) => {
      let path = resolve(dirname(this.root.file), String(file));
      mclang.compileFile(path, { result: this.result })
    }
    Nbt = x => x instanceof TreeNode ? Nbt(this.T(x)) : Nbt(x)
    toNbt = x => x instanceof TreeNode ? toNbt(this.T(x)) : toNbt(x)
    toSnbt = x => x instanceof TreeNode ? toSnbt(this.T(x)) : toSnbt(x)
    toJson = x => x instanceof TreeNode ? toJson(this.T(x)) : toJson(x)
    transform = (node,...args) => {
      if (isNbt(node)) return toNbt(node);
      if (!node?.transform) {
        console.log(node);
        let e = new Error("WTF")
        console.log(e.stack);
        process.exit(-1);
      }
      const ret = node.transform(this,...args);
      if (typeof ret === 'object') {
        console.log((node.$ + " ").padEnd(24, "_"), '=> [obj]', JSON.stringify(ret));
      } else {
        console.log((node.$ + " ").padEnd(24, "_"), '=>', "" + ret);
      }
      return ret;
    }
    createChild = (...args) => {
      return new Frame.Child(this, ...args)
    }
    declareNamespace = (ns, statements) => {
      const C = new Frame.Namespace(this,{ns,statements})
      return C.fn;
    }
    declareFunction = (name, statements) => {
      const C = new Frame.Function(this,{name,statements})
      return C.fn;
    }
    expandMacro = (name,args) => {
      const C = new Frame.Macro(this,{name,args})
      return C.fn
    }
   
    blockCount = 0
   
    addBlock = (lines, ns = this.ns) => {
      return this.result.addAnonFunction(ns, this.resloc, lines, (++this.blockCount));
    }
    
    anonFunction = (...args) => {
      return "function "+this.anonFunctionResloc(...args)
    }

    anonFunctionResloc = (lines, ns = this.ns) => {
      return this.addBlock(lines,ns).resloc;
    }

    ifElse = (checks, thenCode, elseCode) => {
      const stack = `storage zzz_mcl:${this.ns} stack`;
      const top = `${stack}[-1]`;
      return "function "+this.addBlock([
        `data modify ${stack} append value []`,
        `execute ${checks} run data modify ${top} append value 1b`,
        `execute if data ${top}[0] ${thenCode}`,
        `execute unless data ${top}[0] ${elseCode}`,
        `data remove ${top}`
      ]).resloc
    }

    sumCoords = coords => {
      let ret = { x: 0, y: 0, z: 0 };
      for (const { axis, d, f } of coords) ret[axis] += f * this.T(d);
      return ret;
    }

    addJson = (parts, value) => {
      this.result.addJson(parts, value);
    }
    addFunctionTag = (ns, tag, fn) => {
      this.result.addJson(ns, ["tags", "functions", tag], {
        values: [fn]
      })
    }
    constantId = value => {
      const constant = this.result.addConstant(value);
      return constant.id;
    }

    declareVar = (v) => {
      const name = this.scopedName(v);
      const objective = `--${this.ns}--vars`;
      this.vars[v] = { v, name, objective };
    }
    getVar(name) {
      assert(this.vars[name], `Undeclared Variable $${name}`);
      return this.vars[name];
    }
    varExists = name => !!this.vars[name];
    varName = (name) => this.getVar(name).name;
    varObjective = (name) => this.getVar(name).objective;
    varId = (name) => {
      return this.varName(name) + " " + this.varObjective(name)
    }

    declareScore = (s, criterion) => {
      const objective = this.scopedName(s);
      this.scores[s] = { objective, criterion, ns: this.ns };
      this.namespace.addObjective(objective, criterion);
    }
    scoreExists = name => !!this.scores[name];
    scoreObjective = name => this.scores[name].objective;
    scoreCriterion = name => this.scores[name].criterion;

    declareTag = (t) => {
      const name = this.scopedName(t);
      this.tags[t] = { name, ns: this.ns };
    }
    tagExists = name => !!this.tags[name];
    tagId = t => {
      assert(this.tagExists(t), "undeclared tag " + t)
      return this.tags[t].name;
    }

    scopedName(name) {
      console.log("PREFIX",this.prefix,this.ns,this.constructor.name)
      return this.prefix + name;
    }

    get namespace() {
      return this.result.getNamespace(this.ns)
    }
  }

Frame.Root = class FrameRoot extends Frame {
  constructor({ file, ns = "zzz_mcl", args = {}, result } = {}) {
    super();
    this.file = file;
    this.ns = ns;
    this.args = args
    this.scopes = [];
    this.root = this;
    this.result = result ?? new Result();
  }

  macros = {};
  constants = {};
  scores = {};
  vars = {};
  tags = {};
}

Frame.Child = class FrameChild extends Frame {
  constructor(parent, { args = parent.args, ns = parent.ns, scope = null }) {
    super(parent)
    this.parent = parent;
    this.root = parent.root;
    this.ns = ns;
    this.args = args;
    if (scope) {
      this.vars = Object.assign({}, parent.vars)
      this.scores = Object.assign({}, parent.scores)
      this.tags = Object.assign({}, parent.tags)
    } else {
      this.vars = parent.vars;
      this.scores = parent.scores;
      this.tags = parent.tags;
      this.scope = parent.scope;
    }
  }

  get macros() {
    return this.root.macros;
  }
  get constants() {
    return this.root.constants;
  }
  get result() {
    return this.root.result;
  }
}

Frame.Function = class FunctionFrame extends Frame.Child {
  constructor(parent, {name,statements}) {
    super(parent, { scope:true });
    this.fnName = name
    const lines = [];
    for (const s of statements) {
      lines.push(
        "# "+s.text.split(/[\r\n]+/).join("\n# "),
        this.transform(s) )
    }
    //const lines = statements.map(this);
    this.fn = this.result.addFunction(this.ns, this.resloc, this.fnName, lines);
  }
  get resloc() {
    return this.ns + ":" + this.fnName
  }
  get prefix() {
    return "--" + this.ns + "-" + this.fnName + "-"
  }
}

Frame.Namespace = class NamespaceFrame extends Frame.Child {
  constructor(parent, {ns, statements}) {
    super(parent, { ns, scope:true });
    const lines = statements.map(this);
    this.fnName = this.ns+"/load_"+Math.random().toString(36).substr(2)
    this.fn = this.result.addFunction("zzz_mcl", this.resloc, this.fnName, lines);
  }
  get resloc() {
    return "zzz_mcl:" + this.fnName
  }
  get prefix() {
    return "--" + this.ns + "-"
  }
}

Frame.Macro = class MacroFrame extends Frame.Child {
  constructor(parent, {name, args}) {
    super(parent, { args, scope:true });
    this.fnName = this.ns+"/"+name+"_"+Math.random().toString(36).substr(2)
    this.macro = this.macros[name];
    const lines = [];
    for (const s of this.macro.statements) {
      lines.push(
        "# "+s.text.split(/[\r\n]+/).join("\n# "),
        this.transform(s) 
      )
    }
    this.fn = this.result.addFunction("zzz_mcl", this.resloc, this.fnName, lines);
  }
  get resloc() {
    return "zzz_mcl:" + this.fnName
  }
  get prefix() {
    return "--" + this.ns + "-" + this.fnName + "-"
  }
}
