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
      if (node===null) return "";
      return this.T(node);
    }
    importFile = (file) => {
      let path = resolve(dirname(this.root.file),String(file));
      mclang.compileFile(path,{result:this.result})
    }
    Nbt = x => x instanceof TreeNode ? Nbt(this.T(x)) : Nbt(x)
    toNbt = x => x instanceof TreeNode ? toNbt(this.T(x)) : toNbt(x)
    toSnbt = x => x instanceof TreeNode ? toSnbt(this.T(x)) : toSnbt(x)
    toJson = x => x instanceof TreeNode ? toJson(this.T(x)) : toJson(x)
    transform = node => {
      if (isNbt(node)) return toNbt(node);
      if (!node?.transform) {
        console.log(node);
        let e = new Error("WTF")
        console.log(e.stack);
        process.exit(-1);
      }
      return node.transform(this);
    }
    createChild = (...args) => {
      return new Frame.Child(this, ...args)
    }
    addFunction = (name, lines, ns = this.ns) => {
      const fn = this.result.addFunction(ns, name, lines);
      return fn;
    }
    blockCount = 0
    addBlock = (lines, ns = this.ns) => {
      return this.result.addAnonFunction(ns,lines,this.scopes[this.scopes.length-1]+"_"+(++this.blockCount));
    }
    anonFunction = (lines,ns=this.ns) => {
      return "function " + this.addBlock(lines,ns).resloc;
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
      const name = this.scopedName(v,{prefix:"#"});
      const objective = "mcl." + this.ns;
      this.vars[v] = { v, name, objective };
    }
    getVar(name) {
      assert(this.vars[name],`Undeclared Variable $${name}`);
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
      assert(this.tagExists(t),"undeclared tag "+t)
      return this.tags[t].name;
    }

    scopedName(name,{prefix="",joiner=".",suffix=""}={}) {
      return prefix + [...this.scopes, name].join(joiner) + suffix;
    }

    get namespace() {
      return this.result.getNamespace(this.ns)
    }
  }

Frame.Root = class FrameRoot extends Frame {
  constructor({ file, ns = "mcl", args = {}, result } = {}) {
    super();
    console.log("Root Frame",file)
    this.file = file;
    this.ns = ns;
    this.args = args
    this.scopes = [ns];
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
    this.scopes = [...parent.scopes];
    if (scope) {
      this.vars = Object.assign({}, parent.vars)
      this.scores = Object.assign({}, parent.scores)
      this.tags = Object.assign({}, parent.tags)
      this.scopes.push(scope);
    } else {
      this.vars = parent.vars;
      this.scores = parent.scores;
      this.tags = parent.tags;
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
