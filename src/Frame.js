
const { Result } = require("./Result");
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
      return this.proxy;
    }

    transform = node => {
      if (!node?.transform) {
        debugger;
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
    addBlock = (lines, ns = this.ns) => {
      const block_id = "f_" + Math.random().toString(36).substring(2);
      return this.result.addAnonFunction(ns,lines,"f");
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
      const name = "#" + [...this.scopes, v].join(".")
      const objective = "mcl." + this.ns;
      this.vars[v] = { v, name, objective };
      this.variables[name] = objective;
    }
    varExists = name => !!this.vars[name];
    varName = (name) => this.vars[name].name
    varObjective = (name) => this.vars[name].objective
    varId = (name) => this.varName(name) + " " + this.varObjective(name)

    declareScore = (s, criterion) => {
      const objective = [...this.scopes, s].join(".");
      this.scores[s] = { objective, criterion, ns: this.ns };
      this.objectives[objective] = this.scores[s];
      this.namespace.addObjective(objective, criterion);
    }
    scoreExists = name => !!this.scores[name];
    scoreObjective = name => this.scores[name].objective;
    scoreCriterion = name => this.scores[name].criterion;

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

  namespaces = {}
  macros = {};
  files = { mcfunction: {}, json: {} };
  constants = {};
  scores = {};
  vars = {}

  objectives = {};
  variables = {}

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
      this.scopes.push(scope);
    } else {
      this.vars = parent.vars;
      this.scores = parent.scores;
    }
  }

  get macros() {
    return this.root.macros;
  }
  get files() {
    return this.root.files;
  }
  get constants() {
    return this.root.constants;
  }
  get objectives() {
    return this.root.objectives;
  }
  get variables() {
    return this.root.variables;
  }
  get namespaces() {
    return this.root.namespaces;
  }
  get result() {
    return this.root.result;
  }
}
