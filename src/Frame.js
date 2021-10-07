const assert=require("assert");
const { Result } = require("./Result");
const { Nbt } = require("./Nbt")
const { toNbt, toSnbt, toJson } = Nbt;
const Frame = exports.Frame =
  class Frame extends Function {
    constructor() {
      super()
      this.proxy = new Proxy(this, {
        apply: (target, thisArg, args) => target.transform(...args)
      })
      return this.proxy;
    }
    get T() {
      return this.transform;
    }
    Nbt = Nbt
    toNbt = toNbt
    toSnbt = toSnbt
    toJson = toJson
    transform = node => {
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
    varExists = name => !!this.vars[name];
    varName = (name) => this.vars[name].name
    varObjective = (name) => this.vars[name].objective
    varId = (name) => this.varName(name) + " " + this.varObjective(name)

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
  constructor({ ns = "mcl", args = {}, result } = {}) {
    super();
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
