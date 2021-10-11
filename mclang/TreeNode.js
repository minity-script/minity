class MclError extends Error {
  constructor(message, location) {
    super(message);
    this.location = location;
  }
}

const TreeNode = exports.TreeNode = class TreeNode {
  constructor($, props, location) {
    this.$ = $;
    this.location = location;
    if (!this.location) {
      debugger;
    }
    Object.assign(this, props);
    this.transformer = transformers[this.$];
    if (!this.transformer) {
      throw new MclError("no transformer for " + this.$,this.location);
    }
  }
  transform = (frame, proxy = this) => {
    try {
      return this.transformer(proxy, frame)
    } catch (e) {
      e.location ??= this.location;
      throw (e)
    }
  }
}

const transformers = {
  file: ({ namespaces }, { T }) => {
    namespaces.map(T);
  },
  import: ({ file }, { importFile , Nbt}) => {
    importFile(Nbt(file));
  },
  namespace: ({ ns, globals }, { createChild, addBlock, addFunctionTag }) => {
    const S = createChild({ ns, scope: ns });
    const lines = globals.map(S).filter(Boolean);
    const fn = addBlock(lines);
    fn.addTag("minecraft", "load");
  },
  string_lit: ({ value }, { Nbt }) => Nbt(String(value)),
  number_lit: ({ value, suffix }, { Nbt }) => Nbt(+value, suffix),
  boolean_lit: ({ value }, { Nbt }) => Nbt(!!value),
  object_lit: ({ members }, { T, Nbt,toJson }) => {
    //console.log(members)

    const ret = Nbt({});
    for (const { name, value } of members) {
      ret[Nbt(name)] = Nbt(value);
      //console.log(name,JSON.stringify(ret))
    }
    return ret;
  },
  string_json: ({ value }, { toJson }) => toJson(value),
  array_lit: ({ items }, { T, Nbt }) =>  Nbt(items.map(T)),
  template_lit: ({ parts }, { T, Nbt }) =>  Nbt(parts.map(Nbt).join("")),
  
  declare_var: ({ name, value }, { T, toNbt, declareVar, varId }) => {
    declareVar(name);
    if (value) return "scoreboard players set " + varId(name) + " " + toNbt(T(value));
    return "";
  },
  declare_score: ({ name, criterion }, { T, declareScore }) => {
    declareScore(name, criterion);
    return "";
  },
  selector: ({ head, conditions }, { T,toNbt }) => {
    var { initial, conds = [] } = T(head);
    conds = conds.concat(conditions.map(T));
    return "@" + initial + "[" + conds.join(",") + "]"
  },
  cond_brackets:({ name, op, value }, { T} ) => `${name} ${op} ${T(value)}`,
  cond_brackets_noquotes:({ name, op, value }, { T} ) => `${name} ${op} ${T(value)}`,
  cond_brackets_nbt:({ name, op, value }, { toNbt }) => `${name} ${op} ${toNbt(value)}`,
  cond_brackets_pair: ({ name, value }, { T, toNbt }) => T(name) + "=" + T(value),
  cond_brackets_braces: ({ items }, { T, toNbt }) => "{" + items.map(T).join(",") + "}",
  block_spec_state: ({ name, value }, { T }) => T(name) + "=" + T(value),
  block_spec_states: ({ states }, { T }) => "[" + states.map(T).join(",") + "]",
  block_spec: ({ resloc, states, nbt }, { T,O }) => `${T(resloc)}${O(states)}${O(nbt)}`,
  test_block:({ spec }, { T }) => `block ~ ~ ~ ${T(spec)}`,
  test_block_pos:({ pos, spec }, { T }) => `block ${T(pos)} ${T(spec)}`,
  test_predicate:({ resloc }, { T }) => `predicate ${T(resloc)}`,
  resloc(node, { T, ns }) {
    return (node.ns ? T(node.ns) : ns) + ":" + T(node.name);
  },
  resloc_mc(node, { T }) {
    return (node.ns ? T(node.ns) : "minecraft") + ":" + T(node.name);
  },
  restag(node, { T, ns }) {
    return (node.ns ? T(node.ns) : ns) + ":#" + T(node.name);
  },
  restag_mc(node, { T }) {
    return (node.ns ? T(node.ns) : "minecraft") + ":#" + T(node.name);
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
  mod_as:({selector}, { T }) => `as ${T(selector)}`,
  mod_at:({selector}, { T }) => `at ${T(selector)}`,
  mod_for:({selector}, { T }) => `as ${T(selector)} at @s`,
  mod_if:({test}, { T }) => `if ${T(test)}`,
  mod_unless:({test}, { T }) => `unless ${T(test)}`,
  mod_pos: ({ pos }, { T }) => `positioned ${T(pos)}`,
  mod_dir: ({ mods }, { toNbt }) => {
    const pos = { x: 0, y: 0, z: 0 }
    for (const { dir, off, f } of mods) pos[dir] += toNbt(off) * f;
    return `positioned ~${pos.x} ~${pos.y} ~${pos.z}`
  },
  mod_rotated: ({ pos }, { T }) => `rotated ${T(pos)}`,
  mod_rot: ({ mods }, { toNbt }) => {
    const pos = { x: 0, y: 0 }
    for (const { dir, off, f } of mods) pos[dir] += toNbt(off) * f;
    return `rotated ~${pos.x} ~${pos.y}`
  },
  pos_abs: ({x,y,z}, { T }) => `${T(x)} ${T(y)} ${T(z)}`,
  pos_mod({ mods }, { toNbt }) {
    const pos = { x: 0, y: 0, z: 0 }
    for (const { dir, off, f } of mods) pos[dir] += toNbt(off) * f;
    return `~${pos.x} ~${pos.y} ~${pos.z}`
  },
  pos_from:(node, { T }) => `^${T(x)} ^${T(y)} ^${T(z)}`,
  rot_abs: ({x,y}, { T }) => `${T(x)} ${T(y)}`,
  rot_mod({ mods }, { T }) {
    const pos = { x: 0, y: 0, z: 0 }
    for (const { dir, off, f } of mods) pos[dir] += T(off).value * f;
    return `~${pos.x} ~${pos.y}`
  },
  range: ({from,to}, { T }) => `${T(from)}..${T(to)}`,
  range_from: ({from}, { T }) => `${T(from)}..`,
  range_to: ({to}, { T }) => `..${T(to)}`,
  command: ({command}, { T }) => T(command),
  cmd_summon: ({ pos, type, nbt, then }, { T, anonFunction, Nbt, toNbt }) => {
    if (!then) return `summon ${pos ? T(pos) : "~ ~ ~"} ${T(type)}${nbt ? toNbt(nbt) : ''}`

    nbt = Nbt(nbt||{});
    nbt.Tags = [...nbt.Tags || [], "_mclang_summoned_"];
    return anonFunction([
      `summon ${T(type)} ${pos ? T(pos) : "~ ~ ~"} ${toNbt(nbt)}`,
      `execute as @e[tag=_mclang_summoned_] run ${anonFunction([
        'tag @s remove _mclang_summoned_',
        ...then.statements.map(T)
      ])}`
    ])
  },
  cmd_give: ({ selector, type, nbt }, { toNbt, T }) => {
    return `give ${T(selector)} ${T(type)}${toNbt(nbt||{})}`
  },
  cmd_after: ({ time, unit, fn }, { T, toNbt }) => {
    return `schedule ${T(fn)} ${toNbt(time)}${unit}`
  },
  
  cmd_setblock: ({ pos, block }, { T }) => {
    return `setblock ${pos ? T(pos) : "~ ~ ~"} ${T(block)}`
  },
  code({statements}, { T, addBlock }) {
    const lines = statements.map(T);
    return "function " + addBlock(lines).resloc;

  },
  code_resloc(node, { T, addBlock }) {
    const lines = node.statements.map(T);
    return addBlock(lines).resloc;
  },
  "function": ({ name, tags, statements }, { T, addFunction, createChild }) => {
    const S = createChild({ scope: name });
    const lines = statements.map(S);;
    const fn = addFunction(name, lines);
    for ({ ns, name } of tags) {
      fn.addTag(T(ns), T(name));
    }
    return "";
  },
  macro(node, { T, macros }) {
    macros[node.name] = node;
    return "";
  },
  macro_call(node, { Nbt, createChild, macros, addBlock }) {
    const macro = macros[node.name];
    const new_args = {};
    for (const i in macro.args) {
      const { name, def } = macro.args[i];
      const { named, numbered } = node.args;
      if (name in named) {
        new_args[name] = Nbt(named[name])
      } else if (i in numbered) {
        new_args[name] = Nbt(numbered[i])
      } else if (def) {
        new_args[name] = Nbt(def)
      } else {
        throw new Error("arg " + name + " in macro " + macro.name + " is not optional")
      }
    }
    const C = createChild({ args: new_args });
    const ret = macro.statements.map(C);
    if (ret.length < 2) return ret[0];
    return "function " + addBlock(ret).resloc;
  },
  arg(node, { args, Nbt }) {
    return args[node.name];
  },
  
  function_call({ resloc }, { T, ns }) {
    return "function " + T(resloc);
  },
  var_id: ({ name }, {varId, Nbt }) => {
    return varId(name)
  },
  score_id: ({ holder, id }, { T, scoreObjective }) => `${T(holder)} ${scoreObjective(T(id))}`,
  constant_id: ({ value }, { constantId, Nbt }) => constantId(Nbt(value)),
  
  datapath: ({ head, path }, { T }) => `${T(head)} ${T(path)}`,

  datapath_var: ({ path }, { T, ns }) => `storage ${ns}:mcl_vars ${T(path)}`,
  datahead_entity: ({ selector }, { T }) => `entity ${T(selector)}`,
  datahead_storage: ({ name }, { T }) => `storage ${T(name)}`,
  datapath_modify_datapath:({modify,left,right}, { T }) => `data modify ${T(left)} ${modify} from ${T(right)}`,
  datapath_modify_value:({modify,left,right}, { T }) => `data modify ${T(left)} ${modify} value ${T(right)}`,
  datapath_modify_execute:({modify,left,right}, { T, anonFunction }) => anonFunction([
    [
      `data modify ${T(left)} ${modify} value 0`,
      `execute store ${T(left)}[${T(index)}] set ${T(right)}`,
    ]
  ]),
  print: ({ selector, parts }, { T }) => {
    return "tellraw " + (selector ? T(selector) : "@s") + " " + JSON.stringify(parts.map(T));
  },
  print_var: ({ name }, { T, varExists, varName, varObjective }) => {
    return { score: { name: varName(name), objective: varObjective(name) } }
  },
  print_value: ({ value }, { toNbt }) => {
    return { text: toNbt(value) }
  },
  print_string: ({ value }, { toNbt }) => {
    return { text: ""+toNbt(value) }
  },
  print_space: () => {
    return { text: " " }
  },
  delete_datapath: ({ path }, { T }) => `data remove ${T(path)}`,
  template_chars: ({ chars }) => chars,
  template_parts: ({ parts }, { T }) => parts.map(T).join(""),
  template_expand_arg: ({ name }, { toNbt, Nbt, args }) => {
    return Nbt(args[Nbt(name)])
  },
  template_expand_tag: ({ name }, { T, tagId }) => {
    return tagId(T(name))
  },
  template_expand_var: ({ name }, { T, varId }) => {
    return varId(T(name))
  },
  template_expand_score: ({ name }, { T, scoreId }) => {
    return scoreId(T(name))
  },
  ident(node) {
    return node.ident;
  },
  assign_scoreboard_value({ left, right }, { T }) {
    return "scoreboard players set " + T(left) + " " + T(right);
  },
  assign_scoreboard_inc({ left }, { T }) {
    return "scoreboard players add " + T(left) + " 1"
  },
  assign_scoreboard_dec({ left }, { T }) {
    return "scoreboard players add " + T(left) + " " + -1;
  },
  assign_scoreboard_operation({ left, op, right }, { T }) {
    return "scoreboard players operation " + T(left) + " " + op + " " + T(right);
  },
  assign_execute: ({left,right},{T}) => `execute store result ${T(left)} run ${T(right)}`,
  assign_store_scoreboard: ({id},{T}) => `score ${T(id)}`,
  assign_store_datapath: ({path},{T}) => `data ${T(id)}`,
  assign_store_bossbar: ({id},{T}) => `bossbar ${T(id)} ${prop}`,
  assign_run_scoreboard: ({id},{T}) => `scoreboard players get ${T(id)}`,
  assign_store_datapath: ({path},{T}) => `data get ${T(path)}`,
  assign_store_bossbar: ({id},{T}) => `bossbar get ${T(id)} ${prop}`,

  test_entity: ({selector}, { T }) => `entity ${T(selector)}`,
  test_datapath: ({path}, { T }) => `data ${T(path)}`,
  test_scoreboard: ({ left, op, right }, { T }) => `score ${T(left)} ${op} ${T(right)}`,
  test_scoreboard_true: ({ left }, { T }) => `score ${T(left)} matches 1..`,
  test_scoreboard_value: ({ left, op, right }, { T, Nbt }) => {
    const value = Nbt(right);
    switch (op) {
      case '<': return `score ${T(left)} matches ..${value-1}`;
      case '<=': return `score ${T(left)} matches ..${value}`;
      case '>': return `score ${T(left)} matches ${value+1}..`;
      case '>=': return `score ${T(left)} matches ${value}..`;
      case '=': return `score ${T(left)} matches ${value}`;
    }
  },
  tag_id: ({ name }, { T, tagId }) => tagId(T(name)),
  declare_tag: ({ name }, { declareTag, T }) => {
    declareTag(T(name));
    return "";
  },
  tag_set: ({ selector, tag }, { T }) => `tag ${T(selector)} add ${T(tag)}`,
  tag_unset: ({ selector, tag }, { T }) => `tag ${T(selector)} remove ${T(tag)}`,
  nbt_path: ({ path }, { T }) => path.map(T).join(""),
  nbt_path_root: ({ name, match }, { T }) => [name, match].filter(Boolean).map(T).join(""),
  nbt_path_member: ({ name, match }, { T }) => "." + [name, match].filter(Boolean).map(T).join(""),
  nbt_path_list: () => "[]",
  nbt_path_list_element: ({ index }, { T }) => (`[${T(index)}]`),
  nbt_path_list_match: ({ match }, { T }) => `[${T(match)}]`,
  nbt_path_match: ({ match }, { T }) => `${T(match)}`,
  tilde: ({ number }) => `~${number}`,
  raw_tag: ({props,attr,parts},{Nbt,toNbt}) => {
    const ret = Nbt({...props})
    for (const {name,value} of attr) {
      ret[Nbt(name)]=Nbt(value);
    }
    ret.text ??= "";
    if (parts) ret.extra = parts.map(Nbt)
    return Nbt(ret);
    
  },
  raw_chars: ({chars},{Nbt}) => Nbt(chars),
  mod_check_if:({test},{T})=> `if ${T(test)}`,
  mod_check_unless:({test},{T})=> `unless ${T(test)}`,
  mod_checks:({checks},{T})=> checks.map(T).join(" "),
  if_else: ({checks,then_code,else_code}, { T, ifElse }) => {
    return ifElse(
      T(checks),
      T(then_code),
      T(else_code)
    );
  },
  repeat_until: ({ mods, statements, conds, then  }, { T, addBlock, anonFunction,ns }) => {
    
    const MODS = mods.map(T).join(" ");
    const CONDS = conds.map(T).join(" ");
    if (!then) {
      const block = addBlock(lines);
      block._content.push(`execute unless ${CONDS} ${MODS} run function ${block.resloc}`)
      return "function "+block.resloc;
    } else {
      const stack = `storage mcl:${ns} stack`;
      return anonFunction([
        `data modify ${stack} append value []`,
        `execute ${MODS} run ` + anonFunction([
          ...statements.map(T),
          `execute ${CONDS} run data modify ${stack}[-1][0] set value 1b `,
          `execute if data ${stack}[-1][0] run ` + anonFunction([
            ...then.map(T)
          ]),
          [`execute unless data ${stack}[-1][0] ${MODS} run `, Symbol.for("callSelf") ]
          
        ]),
        `data remove ${stack}[-1]`      
      ])
    }
  },
  repeat_cond_until:({test},{T})=>`if ${T(test)}`,
  repeat_cond_while:({test},{T})=>`unless ${T(test)}`,
  every_until: ({ statements, test, time, unit }, { T, Nbt, addBlock }) => {
    const lines = statements.map(T);
    const block = addBlock(lines);
    block._content.push(`execute unless ${T(test)} run schedule function ${block.resloc} ${Nbt(time)}${unit}`)
    return "function "+block.resloc;
  },
}