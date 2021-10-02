const {ValueNode} = require("./ValueNode");

class MclError extends Error {
  constructor(message,location){
    super (message);
    this.location = location;
  }
}

const TreeNode = exports.TreeNode = class TreeNode {
  constructor($,props,location) {
    this.$ = $;
    this.location = location;
    if(!this.location) {
      console.log(this);
      debugger;
    }
    Object.assign(this,props);
    this.transformer = transformers[this.$];
    if(!this.transformer) throw "no transformer for "+this.$;
  }
  transform = frame => {
    try {
      return this.transformer(this,frame)
    } catch (e) {
      console.log([...e.stack.split("\n    at").slice(0,8),"    ...."].join("\n    at"))
      e.location = this.location;
      throw(e)
    }
  }
  assert = (test,message) => {
    if(!test) {
      console.log(this)
      throw new MclError(message,this.location)
    }
  }
}

const transformers = {
  VALUE: node => node,
  literal: (node,frame) => ValueNode.fromLiteral(node,frame),
  file: ({ namespaces },{T}) => {
    namespaces.map(T);
  },
  declare_var: ({name,value},{T,declareVar,varId}) => {
    declareVar(name);
    value = value ? T(value) : 0;
    return "scoreboard players set " + varId(name) + " " + value;
  },
  declare_score: ({name,criterion},{T,declareScore}) => {
    declareScore(name,criterion);
    return "";
  },
  namespace: ({ ns, globals },{createChild,addBlock,addFunctionTag}) => {
    const S = createChild({ns,scope:ns});
    const ret = globals.map(S).filter(Boolean);
    const lines = [
      `scoreboard objectives add mcl.${ns} dummy`,
      ... ret
    ]
    const fn = addBlock(lines);
    fn.addTag("minecraft","load");
  },
  selector: ({ head, conditions }, { T }) => {
    var { initial, conds = [] } = T(head);
    conds = conds.concat(conditions.map(T));
    return "@" + initial + "[" + conds.join(",") + "]"
  },
  cond(node, { T }) {
    return node.name + node.op + T(node.value);
  },
  resloc(node, { T, ns }) {
    return (node.ns ? T(node.ns) : ns) + ":" + T(node.name);
  },
  initial(node) {
    return { initial: node.initial };
  },
  initial_type(node, { T }) {
    return { initial: "e", conds: ["type=" + T(node.type, "minecraft")] };
  },
  execute(node, { T }) {
    return "execute " + node.mods.map(T).join(" ") + " run " + T(node.code)
  },
  mod_as(node, { T }) {
    return "as " + T(node.selector)
  },
  mod_at(node, { T }) {
    return "at " + T(node.selector)
  },
  mod_for(node, { T }) {
    return "as " + T(node.selector) + " at @s"
  },
  mod_pos(node, { T }) {
    return "positioned " + T(node.pos)
  },
  mod_dir(node, { T }) {
    const pos = { x: 0, y: 0, z: 0 }
    for (const { dir, off, f } of node.mods) pos[dir] += T(off).value * f;
    return `positioned ~${pos.x} ~${pos.y} ~${pos.z}`
  },
  mod_if(node, { T }) {
    return "if " + T(node.test)
  },

  test_entity(node, { T }) {
    return "entity " + T(node.selector)
  },
  test_datapath(node, { T }) {
    return "data " + T(node.path)
  },
  pos_abs(node, { T }) {
    return [T(node.x), T(node.y), T(node.z)].join(" ")
  },
  pos_rel(node, { T }) {
    return "~" + [T(node.x), T(node.y), T(node.z)].join(" ~")
  },
  pos_from(node, { T }) {
    return "^" + [T(node.x), T(node.y), T(node.z)].join(" ^")
  },
  range(node, { T }) {
    return T(node.from) + ".." + T(node.to);
  },
  range_from(node, { T }) {
    return T(node.from) + "..";
  },
  range_to(node, { T }) {
    return ".." + T(node.to);
  },
  command(node, { args }) {
    return node.command.replace(/(?<!\\)\{\?([a-z_]\w*)\}/gi, (m, name) => {
      const ret = args[name].convert('string').value
      return ret;
    });
  },
  cmd_give: ({ selector, type, nbt }, { T }) => {
    return `give ${T(selector)} ${T(type)}${nbt ? T(nbt).format() : ''}`
  },
  code(node, { T, addBlock }) {
    const lines = node.statements.map(T);
    return "function "+addBlock(lines).resloc;
 
  },
  "function"(node, { T, addFunction, createChild }) {
    const S = createChild({scope:node.name});
    const lines = node.statements.map(S);;
    addFunction(node.name,lines);
    return "";
  },
  macro(node, { T, macros }) {
    macros[node.name] = node;
    return "";
  },
  macro_call(node, { T, createChild, macros }) {
    const macro = macros[node.name];
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
    const C = createChild({args:new_args});
    const ret = macro.statements.map(C);
    if (ret.length<2) return ret[0];
    return "function "+addBlock(ret).resloc;
  },
  arg(node, { args, files }) {
    return args[node.name].convert(node.type);
  },
  if_else(node, { T, ns, addBlock }) {
    return "function "+addBlock([
      `data modify storage mcl:${ns} stack append value []`,
      `execute if ${T(node.test)} run data modify storage mcl:${ns} stack[-1] append value 1b`,
      `execute if data storage mcl:${ns} stack[-1][0] run ${T(node.code)}`,
      `execute unless data storage mcl:${ns} stack[-1][0] run ${T(node._else)}`,
      `data remove storage mcl:${ns} stack[-1]`
    ]).resloc;
  },
  call(node, { T, ns }) {
    return "function " + ns +":" +node.name;
  },
  score(node, { T }) {
    return T(node.holder) + " " + node.id
  },
  json(node, { T }) {
    return T(node.json)
  },
  datapath(node, { T }) {
    return T(node.head) + " " + node.steps.map(T).join(".")
  },
  datapath_var(node, { T, ns }) {
    return "storage "+ ns+":mcl_vars " + node.steps.map(T).join(".")
  },
  datahead_entity(node, { T }) {
    return "entity " + T(node.selector)
  },
  datahead_storage(node, { T }) {
    return "storage " + T(node.name)
  },
  var_id:({name,assert},{varExists,varId}) => {
    assert(varExists(name),"Undeclared var $"+name);
    return varId(name);
  },
  constant_id:({value},{constantId,T}) => {
    return constantId(T(value));
  },
  assign_var_value({left,right}, { T }) {
    return "scoreboard players set " + T(left) + " " + T(right);
  },
  assign_var_inc({left}, { T }) {
    return "scoreboard players add " + T(left) + " 1"
  },
  assign_var_dec({left}, { constantId, T }) {
    const c = constantId(1);
    return "scoreboard players add " + T(left) + " " + c;
  },
  assign_var_add_value({left,right}, { T }) {
    return "scoreboard players add " + T(left) + " " + T(right);
  },
  assign_var_sub_value({left,right}, { T }) {
    return "scoreboard players add " + T(left) + " " + -T(right);
  },
  assign_var_var({left,right}, { T}) {
    return "scoreboard players operation " + T(left) + " = " + T(right);
  },
  assign_var_operation({left,op,right}, { T }) {
    return "scoreboard players operation " + T(left) + " " + op +" " + T(right);
  },
  assign_score_datapath(node, { T }) {
    return "execute store result score " + T(node.left) + " run data get " + T(node.right);
  },
  assign_score_statement(node, { T }) {
    return "execute store result score " + T(node.left) + " run " + T(node.right);
  },
    assign_score_value(node, { T }) {
    return "scoreboard players set " + T(node.left) + " " + T(node.right);
  },
  assign_score_score(node, { T }) {
    return "scoreboard players operation " + T(node.left) + " = " + T(node.right);
  },
  assign_score_datapath(node, { T }) {
    return "execute store result score " + T(node.left) + " run data get " + T(node.right);
  },
  assign_score_statement(node, { T }) {
    return "execute store result score " + T(node.left) + " run " + T(node.right);
  },
  assign_datapath_value(node, { T }) {
    return "data modify " + T(node.left) + " set value " + T(node.right);
  },
  assign_datapath_score(node, { T }) {
    return "execute store result " + T(node.left) + " run scoreboard players get " + T(node.right);
  },
  assign_datapath_datapath(node, { T }) {
    return "data modify " + T(node.left) + " set from " + T(node.right);
  },
  assign_datapath_statement(node, { T }) {
    return "execute store result " + T(node.left) + " run " + T(node.right);
  },
  print: ({selector,parts},{ T }) => {
    return "tellraw "+(selector ? T(selector): "@s")+" "+JSON.stringify(parts.map(T));
  },
  print_var: ({name,assert},{ T, varExists, varName, varObjective }) => {
    assert(varExists(name),"undeclared var $"+name);
    return {score:{name:varName(name),objective:varObjective(name)} }
  },
  print_value: ({value},{ T }) => {
    return {text:T(value).format()}
  },
  print_string: ({value},{ T }) => {
    return {text:T(value).value}
  },
  print_space: () => {
    return {text:" "}
  },
  delete_datapath: ({ path }, { T }) => `data remove ${T(path)}`,
  template_chars: ({ chars }) => chars,
  template_expand: ({ name }, { args }) => {
    return args[name].convert("string").value
  },
  ident(node) {
    return node.ident;
  }
}