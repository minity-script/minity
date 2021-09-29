class ValueNode {
  $ = "VALUE";
  static cast = value => value

  static fromLiteral(node) {
    return this.types[node.type].doFromLiteral(node);
  }

  static fromValueNode(node,type=node.type) {
    return this.types[node.type].doFromValueNode(node,type);
  }


  static doFromLiteral(node) {
    return new this(node)
  }
  static doFromValueNode(node,type) {
    return new this({...node,type})
  }

  constructor({ type, value }) {
    this.type = type;
    this.value = this.constructor.cast(value);
  }
  format = () => JSON.stringify(this.value)
  toString() {
    return this.format()
  }
  static types = {}
}

ValueNode.types.string = ValueNode.String = class ValueString extends ValueNode {
  static cast = value => String(value);
  format = () => this.value.match(/^[a-z][a-z0-9_]*$/) ? this.value : JSON.stringify(this.value)
}

ValueNode.types.ident = ValueNode.Ident = class ValueIdent extends ValueNode.String {
}

ValueNode.types.number = ValueNode.Number = class ValueNumber extends ValueNode {
  static cast = value => value && +value || 0;
  constructor({ suffix, ...rest }) {
    super(rest);
    this.suffix = suffix
  }
  format = () => this.value + (this.suffix || "")
}

ValueNode.types.float = ValueNode.Float = class ValueFloat extends ValueNode.Number {
    
}

ValueNode.types.bool = ValueNode.bool = class ValueBool extends ValueNode {
    
}

ValueNode.types.int = ValueNode.Int = class ValueInt extends ValueNode.Number  {
  static cast = value => value && +value | 0;
}

ValueNode.types.array = ValueNode.Array = class ValueArray extends ValueNode {
  static cast = value => [].concat(value);

  static doFromLiteral({items,...rest}) {
    return super.doFromLiteral({
      items:items.map(T),
      ...rest
    })
  }
  constructor({items,...rest}) {
    super(rest);
    this.items = items;
    this.value = items.map(it=>it.value)
  }
  format = () => {
    console.log('format array',this.items[0]?.format())
    return "[" + this.items.map(it=>it.format()).join(',')+"]"
  }
}

ValueNode.types.template = ValueNode.Template = class ValueTemplate extends ValueNode.String {
  static cast = value => String(value);

  static doFromLiteral({parts,...rest}) {
    return super.doFromLiteral({
      parts:parts.map(T),
      ...rest
    })
  }
  constructor({parts,...rest}) {
    super(rest);
    this.parts = parts;
    this.value = parts.join('')
  }
}


ValueNode.types.object = ValueNode.Object = class ValueObject  extends ValueNode {
  static cast = value => Object.assign({},value);

  static doFromLiteral({members,...rest}) {
    return super.doFromLiteral({
      members: members.map(it=>{
        return {name:T(it.name),value:T(it.value)}
      }),
      ...rest
    })
  }
  constructor({members,...rest}) {
    super(rest);
    this.members = members;
    this.value = {};
    for (const {name,value} of members) {
      this.value[name.format()]=value.value;
    }
  }
  format = () => {
    return "{" + this.members.map(it=>it.name.format()+":"+it.value.format()).join(',')+"}"
  }
}

ValueNode.types.string_json = ValueNode.StringJson = class ValueStringJson  extends ValueNode.String {

  static doFromLiteral({value,...rest}) {
    return super.doFromLiteral({
      value: JSON.stringify(T(value).value),
      ...rest
    })
  }
}


const fs = require("fs");
const peggy = require("peggy");

const grammar = fs.readFileSync(__dirname + "/mcl.pegjs", { encoding: "utf8" });
const parser = peggy.generate(grammar);

const mcl = module.exports = {
  parse(text) {
    return parser.parse(text);
  },
  transform(tree, ns = "default") {
    NS = ns;
    return T(tree)
  },
  compile(text, ns = "default") {
    return mcl.transform(mcl.parse(text), ns)
  }
}

const MACROS = {};
var MACRO_ARGS = {};
var PARENT_ARGS = {};

const STACK = [PARENT_ARGS];

function PUSH(new_args) {
  PARENT_ARGS = MACRO_ARGS;
  STACK.push(MACRO_ARGS);
  MACRO_ARGS = new_args;
}

function POP() {
  MACRO_ARGS = STACK.pop();
  PARENT_ARGS = STACK[STACK.length - 1] || {}
}

const FILES = {}
var NS = "default"
var TESTCOUNT = 0;
function T(node, ...args) {
  if (!node || !processors[node.$]) {
    if (typeof node == "object") return JSON.stringify(node)
    return node;
  }
  return processors[node.$](node, ...args);
}



const processors = {
  VALUE: node => node,
  literal: node => ValueNode.fromLiteral(node),
  file: ({globals})=> {
    globals.map(T);
    return FILES;
  },
  namespace: ({ns}) => {
    NS = ns;
    return "";
  },
  selector: ({head,conditions}) => {
    var { initial, conds = [] } = T(head);
    conds = conds.concat(conditions.map(T));
    return "@" + initial + "[" + conds.join(",") + "]"
  },
  cond(node) {
    return node.name + node.op + T(node.value);
  },
  resloc(node, ns = NS) {
    return (node.ns ? T(node.ns) : ns) + ":" + T(node.name);
  },
  initial(node) {
    return { initial: node.initial };
  },
  initial_type(node) {
    return { initial: "e", conds: ["type=" + T(node.type, "minecraft")] };
  },
  execute(node) {
    return "execute " + node.mods.map(T).join(" ") + " run " + T(node.code)
  },
  mod_as(node) {
    return "as " + T(node.selector)
  },
  mod_at(node) {
    return "at " + T(node.selector)
  },
  mod_for(node) {
    return "as " + T(node.selector) + " at @s"
  },
  mod_pos(node) {
    return "positioned " + T(node.pos)
  },
  mod_dir(node) {
    const pos = { x: 0, y: 0, z: 0 }
    for (const { dir, off, f } of node.mods) pos[dir] += T(off).value * f;
    return `positioned ~${pos.x} ~${pos.y} ~${pos.z}`
  },
  mod_if(node) {
    return "if " + T(node.test)
  },

  test_entity(node) {
    return "entity " + T(node.selector)
  },
  test_datapath(node) {
    return "data " + T(node.path)
  },
  pos_abs(node) {
    return [T(node.x), T(node.y), T(node.z)].join(" ")
  },
  pos_rel(node) {
    return "~" + [T(node.x), T(node.y), T(node.z)].join(" ~")
  },
  pos_from(node) {
    return "^" + [T(node.x), T(node.y), T(node.z)].join(" ^")
  },
  range(node) {
    return T(node.from) + ".." + T(node.to);
  },
  range_from(node) {
    return T(node.from) + "..";
  },
  range_to(node) {
    return ".." + T(node.to);
  },
  command(node) {
    return node.command.replace(/(?<!\\)\{\?([a-z_]\w*)\}/gi, (m, name) => {
      const ret = ValueNode.fromValueNode(MACRO_ARGS[name],'string').value
      return ret;
    });
  },
  cmd_give:({selector,type,nbt}) => {
    return `give ${T(selector)} ${T(type)}${nbt?T(nbt).format():''}`
  },
  code(node) {
    const ret = node.statements.map(T);;
    const id = 'mcl/block_' + Object.keys(FILES).length;
    const file = NS + '/functions/' + id + '.mcfunction';
    FILES[file] = ret;
    return "function " + NS + ":" + id;
  },
  "function"(node) {
    const ret = node.statements.map(T);;
    const id = NS + '/functions/' + node.name + ".mcfunction";
    FILES[id] = ret;
    return "";
  },
  macro(node) {
    MACROS[node.name] = node;
    return "";
  },
  macro_call(node) {
    const macro = MACROS[node.name];
    const new_args = {};
    for (const i in macro.args) {
      const { name, def } = macro.args[i];
      const { named, numbered } = node.args;
      if (name in named) {
        new_args[name] = T(named[name])
      } else if (i in numbered) {
        new_args[name] = T(numbered[i])
      } else if (def) {
        new_args[name] = T(def)
      } else {
        throw new Error("arg " + name + " in macro " + macro.name + " is not optional")
      }
    }
    PUSH(new_args);
    const ret = macro.statements.map(T);
    POP();

    const id = 'mcl/macro_' + macro.name + "_" + Object.keys(FILES).length;
    const file = NS + '/functions/' + id + '.mcfunction';
    FILES[file] = ret;
    return "function " + NS + ":" + id;
  },
  arg(node) {
    const arg = ValueNode.fromValueNode(MACRO_ARGS[node.name],node.type);
    return arg;
  },
  if_else(node) {
    const id = 'mcl/ifelse_' + Object.keys(FILES).length;
    const file = NS + '/functions/' + id + '.mcfunction';
    FILES[file] = [
      `data modify storage ${NS}:mcl stack append value []`,
      `execute if ${T(node.test)} run data modify storage ${NS}:mcl stack[-1] append value 1b`,
      `execute if data storage ${NS}:mcl stack[-1][0] run ${T(node.code)}`,
      `execute unless data storage ${NS}:mcl stack[-1][0] run ${T(node._else)}`,
      `data modify remove storage ${NS}:mcl stack[-1]`
    ];
    return "function " + NS + ":" + id;
  },
  call(node) {
    return "function " + node.name;
  },
  score(node) {
    return T(node.holder) + " " + node.id
  },
  json(node) {
    return T(node.json)
  },
  datapath(node) {
    return T(node.head) + " " + node.steps.map(T).join(".")
  },
  datapath_var(node) {
    return "mcl_vars:" + NS + " " + node.steps.map(T).join(".")
  },
  datahead_entity(node) {
    return "entity " + T(node.selector)
  },
  datahead_storage(node) {
    return "storage " + T(node.name)
  },
  assign_score_value(node) {
    return "scoreboard players set " + T(node.left) + " " + T(node.right);
  },
  assign_score_score(node) {
    return "scoreboard players operation " + T(node.left) + " = " + T(node.right);
  },
  assign_score_datapath(node) {
    return "execute store result score " + T(node.left) + " run data get " + T(node.right);
  },
  assign_score_statement(node) {
    return "execute store result score " + T(node.left) + " run " + T(node.right);
  },
  assign_datapath_value(node) {
    return "data modify " + T(node.left) + " set value " + T(node.right);
  },
  assign_datapath_score(node) {
    return "execute store result " + T(node.left) + " run scoreboard players get " + T(node.right);
  },
  assign_datapath_datapath(node) {
    return "data modify " + T(node.left) + " set from " + T(node.right);
  },
  assign_datapath_statement(node) {
    return "execute store result " + T(node.left) + " run " + T(node.right);
  },
  delete_datapath: ({path}) => `data remove ${T(path)}`,
  template_chars: ({chars}) => chars,
  template_expand: ({name}) => ValueNode.fromValueNode(MACRO_ARGS[name],"string").value,
  ident(node) {
    return node.ident;
  }
}