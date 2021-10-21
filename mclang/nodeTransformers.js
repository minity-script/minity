
const {rawTags} = require("./rawTags");
const {Selector, SelectorUUID} = require("./Selector");
const { randomString } = require("./utils");
const assert = require("assert");
const transformers = exports.transformers = {
  file: ({ namespaces }, { T }) => {
    namespaces.map(T);
  },
  import: ({ file }, { importFile, Nbt }) => {
    importFile(Nbt(file));
  },
  DeclareNamespace: ({ ns, globals }, { T, declareNamespace }) => {
    const fn = declareNamespace(ns, globals);
    fn.addTag("minecraft", "load");
    return "";
  },
  DeclareFunction: ({ name, tags, statements }, { T, declareFunction, ns:NS }) => {
    const fn = declareFunction(T(name), statements);
    for (const {ns,name} of tags) {
      fn.addTag(ns ? T(ns) : NS, T(name));
    }
    return "# function " + fn.resloc;
  },
  DeclareMacro:({name,...props}, { declareMacro }) => {
    declareMacro(name,props);
    return "";
  },
  DeclareEvent({trigger,conditions,then}, { T, ns, declareEvent, addBlock }) {
    const id = randomString();
    const block = addBlock([
      ...then.map(T),
      `advancement revoke @s only ${ns}:${id}`
    ])
    
    declareEvent(id, T(trigger),T(conditions),block.resloc);
    return "";
  },
  CallSelf: ({ }, { resloc }) => "function " + resloc,
  string_lit: ({ value }, { Nbt }) => Nbt(String(value)),
  number_lit: ({ value, suffix }, { Nbt }) => {
    return Nbt(+value, suffix)
  },
  boolean_lit: ({ value }, { Nbt }) => Nbt(!!value),
  object_lit: ({ members }, { T, Nbt, toJson }) => {
    //console.log(members)

    const ret = Nbt({});
    for (const { name, value } of members) {
      ret[Nbt(name)] = Nbt(value);
      //console.log(name,JSON.stringify(ret))
    }
    return ret;
  },
  string_json: ({ value }, { Nbt, toJson }) => {
    return Nbt(JSON.stringify(Nbt(value)),true);
  },
  string_snbt: ({ value }, { Nbt, toNbt }) => {
    return Nbt(toNbt(value),true);
  },
  array_lit: ({ items }, { T, Nbt }) => Nbt(items.map(T)),
  template_lit: ({ parts }, { T, Nbt }) => Nbt(parts.map(Nbt).join("")),

  declare_var: ({ name, value }, { T, toNbt, declareVar, varId }) => {
    declareVar(name);
    if (value) return "scoreboard players set " + varId(name) + " " + toNbt(T(value));
    return "";
  },
  declare_score: ({ name, criterion }, { T, declareScore }) => {
    declareScore(name, criterion);
    return "";
  },
  selector_spec: ({ initial, conditions }, { T, toNbt }) => {
    const spec = T(initial);
    for (const c of conditions) T(c, { spec });
    return spec
  },
  selector_uuid: ({uuid},T) => new SelectorUUID(T(uuid)),
  selector: ({spec},{T}) => T(spec).format(),
  selector_single: ({ spec }, { T, toNbt }) => {
    const it = T(spec);
    assert(it.isSingle,"Selector must select a single entity")
    return it.format();
  },
  selector_optional: ({ spec }, { T, toNbt }) => {
    if (spec) return T(spec).format();
    return new Selector("s").format();
  },
  selector_initial: ({ initial }) => new Selector(initial),
  selector_initial_type: ({ type }, { T }) => new Selector(T(type)),
  cond_brackets: ({ name, op, value }, { T }, { spec }) => {
    //if (!value) console.log(name,op,value)
    spec[op](name, T(value))
  },
  cond_brackets_lit: ({ name, op, value }, { T }, { spec }) => {
    spec[op](name, value)
  },
  cond_brackets_score: ({ name, value }, { T }, { spec }) => {
    spec.score(T(name), T(value))
  },
  cond_brackets_nbt: ({ name, op, value }, { T, toNbt }, { spec }) => {
    spec[op](name, toNbt(value))
  },
  cond_brackets_pair: ({ name, value }, { T, toNbt }) => T(name) + "=" + T(value),
  cond_brackets_braces: ({ items }, { T, toNbt }) => "{" + items.map(T).join(",") + "}",
  block_spec_state: ({ name, value }, { T }) => T(name) + "=" + T(value),
  block_spec_states: ({ states }, { T }) => "[" + states.map(T).join(",") + "]",
  block_spec: ({ resloc, states, nbt }, { T, O }) => `${T(resloc)}${O(states)}${O(nbt)}`,
  test_block: ({ spec }, { T }) => `block ~ ~ ~ ${T(spec)}`,
  test_block_pos: ({ pos, spec }, { T }) => `block ${T(pos)} ${T(spec)}`,
  test_predicate: ({ resloc }, { T }) => `predicate ${T(resloc)}`,
  resname: ({parts},{T}) => parts.map(T).join("/"),
  resloc(node, { T, ns }) {
    return (node.ns ? T(node.ns) : ns) + ":" + T(node.name);
  },
  resloc_mc(node, { T }) {
    return (node.ns ? T(node.ns) : "minecraft") + ":" + T(node.name);
  },
  restag(node, { T, ns }) {
    return '#'+(node.ns ? T(node.ns) : ns) + ":" + T(node.name);
  },
  restag_mc(node, { T }) {
    return '#'+(node.ns ? T(node.ns) : "minecraft") + ":" + T(node.name);
  },
  execute(node, { T }) {
    return "execute " + node.mods.map(T).join(" ") + " run " + T(node.code)
  },
  range: ({ from, to }, { T }) => `${T(from)}..${T(to)}`,
  range_from: ({ from }, { T }) => `${T(from)}..`,
  range_to: ({ to }, { T }) => `..${T(to)}`,
  range_gt_int: ({ from }, { Nbt }) => `${Nbt(from) + 1}..`,
  range_lt_int: ({ to }, { Nbt }) => `..${Nbt(to) - 1}`,
  range_gt: ({ from }, { Nbt }) => `${Nbt(from) + 0.000001}..`,
  range_lt: ({ to }, { Nbt }) => `..${Nbt(to) - 0.000001}`,
  command: ({ command }, { T }) => T(command),
  cmd_say: ({ parts }, { T }) => `say ${T(parts)}`,
  cmd_summon: ({ pos, type, nbt, then }, { T, anonFunction, Nbt, toNbt }) => {
    if (!then) return `summon ${T(type)}${nbt ? toNbt(nbt) : ''} ${pos ? T(pos) : "~ ~ ~"}`
    const tag = "--mclang--internal-summoned"
    nbt = Nbt(nbt || {});
    nbt.Tags = [...nbt.Tags || [], tag];
    return anonFunction([
      `summon ${T(type)} ${pos ? T(pos) : "~ ~ ~"} ${toNbt(nbt)}`,
      `execute as @e[tag=${tag}] run ${anonFunction([
        `tag @s remove ${tag}`,
        ...then.map(T)
      ])}`
    ])
  },
  
  cmd_give: ({ selector, count, type, nbt }, { toNbt, T }) => {
    count = count ? toNbt(count) : "1";
    nbt = nbt ? toNbt(nbt) : "{}";
    return `give ${T(selector)} ${T(type)}${nbt} ${count}`
  },
  cmd_clear: ({ selector, count, type, nbt }, { toNbt, T }) => {
    count = count ? toNbt(count) : "1";
    nbt = nbt ? toNbt(nbt) : "{}";
    return `clear ${T(selector)} ${T(type)}${nbt} ${count}`
  },
  cmd_after: ({ time, unit, statements,then }, { T, anonFunction, toNbt }) => {
    const lines = statements.map(T);
    if (then) lines.push(T(then));
    const fn = anonFunction(lines)
    return `schedule ${fn} ${toNbt(time)}${unit}`
  },
  cmd_setblock: ({ pos, block }, { T }) => {
    return `setblock ${pos ? T(pos) : "~ ~ ~"} ${T(block)}`
  },

  var_id: ({ name }, { varId, Nbt }) => {
    return varId(name)
  },
  score_id: ({ holder, id }, { T, scoreObjective }) => `${T(holder)} ${scoreObjective(T(id))}`,
  constant_id: ({ value }, { constantId, Nbt }) => constantId(Nbt(value)),

  datapath: ({ head, path }, { T }) => `${T(head)} ${T(path)}`,

  datapath_var: ({ path }, { T, ns }) => `storage ${ns}:mcl_vars ${T(path)}`,
  datahead_entity: ({ selector }, { T }) => `entity ${T(selector)}`,
  datahead_storage: ({ name }, { T }) => `storage ${T(name)}`,
  datahead_block: ({ position }, { T }) => `block ${T(position)}`,
  datapath_modify_datapath: ({ modify, left, right }, { T }) => `data modify ${T(left)} ${modify} from ${T(right)}`,
  datapath_modify_value: ({ modify, left, right }, { toNbt, T }) => {
    return `data modify ${T(left)} ${modify} value ${toNbt(T(right))}`
  },
  datapath_modify_execute: ({ modify, scale, left, right }, { T, addBlock }) => "function " + addBlock([
    [
      `data modify ${T(left)} ${modify} value 0`,
      `execute store ${T(left)}[${T(index)}] set ${T(right)}`,
    ]
  ]),
  print: ({ selector, line }, { T }) => {
    return "tellraw " + (selector ? T(selector) : "@s") + " " + JSON.stringify(T(line));
  },
  raw_line:({parts},{T}) => parts.map(T),
  delete_datapath: ({ path }, { T }) => `data remove ${T(path)}`,
  template_chars: ({ chars }) => chars,
  template_parts: ({ parts }, { T }) =>  parts.map(T).join(""),
  template_expand_arg: ({ name }, { toNbt, Nbt, getArg }) => Nbt(getArg(Nbt(name))),
  template_expand_tag: ({ name }, { T, tagId }) => tagId(T(name)),
  template_expand_var: ({ name }, { T, varId }) => varId(T(name)),
  template_expand_score: ({ name }, { T, scoreObjective }) => scoreObjective(T(name)),
  template_expand_value: ({ value }, { Nbt }) => {
    return JSON.stringify(Nbt(value))
  },
  template_expand_score_id: ({ id }, { T }) => (T(id)),
  template_expand_selector: ({ selector }, { T }) => T(selector),

  raw_expand_var: ({ name }, { T, Nbt, varObjective,varName}) => Nbt({
    score:{
      objective: varObjective(T(name)),
      name: varName(T(name)),
    }
  }),
  raw_expand_score_id: ({ holder, id }, { T, Nbt, scoreObjective}) => Nbt({
    score:{
      objective: scoreObjective(T(id)),
      name: Nbt(T(holder)),
    }
  }),
  ident(node) {
    return node.ident;
  },
  assign_scoreboard_value: ({ left, right }, { T }) => `scoreboard players set ${T(left)} ${T(right)}`,
  assign_scoreboard_add: ({ left, right }, { T }) => `scoreboard players add ${T(left)} ${T(right)}`,
  assign_scoreboard_remove: ({ left, right }, { T }) => `scoreboard players remove ${T(left)} ${T(right)}`,
  assign_scoreboard_inc: ({ left }, { T }) => `scoreboard players add ${T(left)} 1`,
  assign_scoreboard_dec: ({ left }, { T }) => `scoreboard players remove ${T(left)} 1`,

  assign_scoreboard_operation({ left, op, right }, { T }) {
    return "scoreboard players operation " + T(left) + " " + op + " " + T(right);
  },
  assign_execute: ({ left, right }, { T }) => `execute store result ${T(left)} run ${T(right)}`,
  assign_success: ({ left, right }, { T }) => `execute store success ${T(left)} run ${T(right)}`,
  assign_store_scoreboard: ({ id }, { T }) => `score ${T(id)}`,
  assign_store_datapath: ({ path, scale}, { T, Nbt  }) => {
    if (!scale) return `${T(path)} int 1`;
    scale = Nbt(scale);
    const type = {s:"short",i:"int",b:"byte",l:"long",d:"double",f:"float"}[scale.suffix||"i"]
    return `${T(path)} ${type} ${scale}`;
  },
  assign_store_bossbar: ({ id, prop }, { T }) => `bossbar ${T(id)} ${prop}`,
  assign_run_scoreboard: ({ id }, { T }) => `scoreboard players get ${T(id)}`,
  assign_run_datapath: ({ path }, { T }) => `data get ${T(path)}`,
  assign_run_bossbar: ({ id }, { T }) => `bossbar get ${T(id)} ${prop}`,
  assign_run_statement: ({ statement }, { T }) => `${T(statement)}`,
  assign_run_conditions: ({ conds }, { T }) => `${T(conds)}`,

  assign_bossbar_set: ({id, prop,value},{T})=>`bossbar set ${T(id)} ${prop} ${T(value)}`,

  test_entity: ({ selector }, { T }) => `entity ${T(selector)}`,
  test_datapath: ({ path }, { T }) => `data ${T(path)}`,
  test_scoreboard: ({ left, op, right }, { T }) => `score ${T(left)} ${op} ${T(right)}`,
  test_scoreboard_true: ({ left }, { T }) => `score ${T(left)} matches 1..`,
  test_scoreboard_zero: ({ id }, { T }) => `score ${T(id)} matches 0`,
  test_scoreboard_range: ({ left, right }, { T, Nbt }) => `score ${T(left)} matches ${T(right)}`,
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
  nbt_path_list_match: ({ match }, { toNbt }) => `[${toNbt(match)}]`,
  nbt_path_match: ({ match }, { toNbt }) => `${toNbt(match)}`,
  tilde: ({ number }) => `~${number}`,
  raw_tag: ({ tag, attr, parts }, { T, Nbt, toNbt },state={block:true,first:true,last:true}) => {
    var props = {};
    var block = false, paragraph = false;
    var attrs = {};
    for (const { name, value } of attr) {
      attrs[Nbt(name)] = Nbt(value);
    }
    const spec = rawTags[tag];
    if (!spec) {
      props = {...attrs} 
    } else {
      block = spec.block;
      paragraph = spec.paragraph;
      if (typeof spec.props === "function") {
        props = spec.props(attrs)
      } else {
        props = {...attrs, ...spec.props}
      }
    }
    const ret = Nbt({ ...props })
    
    ret.text ??= "";
    
    if (parts) {
      const mystate = Object.assign({},state)
      ret.extra = [];
      for (const i in parts) {
        mystate.first = i == 0;
        mystate.last = i == parts.length-1;
        ret.extra.push(T(parts[i],mystate))
      }
    }
    if (paragraph) {
      state.block = true;
      if (!state.block && (!state.last)) {
        return ["\n",Nbt(ret),"\n\n"]
      } else if (!state.last) {
        return [Nbt(ret),"\n\n"]
      } 
    } else if (block) {
      state.block = true;
      if (!state.block && (!state.last)) {
        return ["\n",Nbt(ret),"\n"]
      } else if (!state.last) {
        return [Nbt(ret),"\n"]
      } 
    } 
    return Nbt(ret);
  },
  raw_chars: ({ chars }, { Nbt },state) => {
    if (state.first) chars=chars.trimStart();
    if (state.last) chars=chars.trimEnd();
    state.block = false;
    return Nbt(chars)
  },
  raw_chars_ws: ({ chars }, { Nbt },state) => {
    if (state.last||state.first) {
      return ""
    }
    if (!state.block) {
      state.block = true;
      return "\n";
    }
    return ""
  },

  bossbar_add: ({id,name},{T,toNbt})=>`bossbar add ${T(id)} ${toNbt(name)}`,

  /************************************************************************* */
  Execution: ({ modifiers, executable }, { T }) => `execute ${modifiers.map(T).join(" ")} ${T(executable)}`,
  Executable: ({ last }, { T }) => `run ${T(last)}`,

  ModifierNative: ({ MOD, arg }, { T }) => `${MOD} ${T(arg)}`,
  ModifierNativeLiteral: ({ MOD, ARG }, { T }) => `${MOD} ${ARG}`,
  ModifierFor: ({ arg }, { T }) => `as ${T(arg)} at @s`,
  ModifierFacing: ({ selector, anchor }, { T }) => `facing entity ${T(selector)} ${anchor||'eyes'}`,
  StructureIfElse: ({ arg, then, otherwise }, { T, anonFunction, ifElse }) => (
    otherwise
      ? anonFunction(ifElse(T(arg), T(then), T(otherwise)))
      : `execute ${T(arg)} run ${T(then)}`
  ),
  Conditionals: ({ subs }, { T }) => subs.map(T).join(" "),
  ConditionalIf: ({ arg }, { T }) => `if ${T(arg)}`,
  ConditionalUnless: ({ arg }, { T }) => `unless ${T(arg)}`,

  CodeBlock: ({ statements }, { T, addBlock }) => {
    if (statements.length == 1) return T(statements[0]);
    return "function " + addBlock(statements.map(T)).resloc;
  },
  AnonFunctionResloc: ({ statements }, { T, anonFunctionResloc }) => {
    return anonFunctionResloc(statements.map(T));
  },
  RelativeCoords: ({ _coords }, { sumCoords }) => {
    let { x, y, z } = sumCoords(_coords);
    return `~${x || ""} ~${y || ""} ~${z || ""}`
  },
  LocalCoords: ({ _coords }, { sumCoords }) => {
    let { x, y, z } = sumCoords(_coords);
    return `^${x || ""} ^${y || ""} ^${z || ""}`
  },
  RelativeAngles: ({ _coords }, { sumCoords }) => {
    let { x, y } = sumCoords(_coords);
    return `~${x || ""} ~${y || ""}`
  },
  NativeAngles: ({ x, y }, { T }) => `${T(x)} ${T(y)}`,
  NativeCoords: ({ x, y, z }, { T }) => `${T(x)} ${T(y)} ${T(z)}`,
  TildeCoord: ({ arg }, { T }) => arg ? `~${T(arg)}` : '~',
  CaretCoord: ({ arg }, { T }) => arg ? `^${T(arg)}` : '^',
  StructureRepeat: ({ mods=[], statements=[], conds, then }, { T, ifElse, anonFunction, addBlock, ns }) => {
    const MODS = (mods||[]).map(T).join(" ");
    const CONDS = T(conds);
    if (!then) {
      const block = addBlock(statements.map(T));
      block._content.push(`execute ${CONDS}${MODS} run function ${block.resloc}`)
      return "function " + block.resloc;
    } else {
      const block = addBlock([]);
      block._content = [
        `execute ${MODS} run ` + anonFunction([
          ...(statements||[]).map(T),
          ...ifElse(CONDS,`function ${block.resloc}`,T(then))
        ])
      ];
      return "function "+block.resloc
    }
  },
  every_until: ({ statements, conds, then, time, unit }, { T, Nbt, addBlock, anonFunction, ifElse }) => {
    if (!then) {
      const lines = statements.map(T);
      const block = addBlock(lines);
      block._content.push(`execute ${T(conds)} run schedule function ${block.resloc} ${Nbt(time)}${unit}`)
      return "function " + block.resloc;
    } else {
      const block = addBlock([]);
      block._content = [
        anonFunction([
          ...(statements||[]).map(T),
          ...ifElse(T(conds),`schedule function ${block.resloc} ${Nbt(time)}${unit}`,T(then))
        ])
      ];
      return "function "+block.resloc
    }
  },
  BlockArgThen: ({ }, { args }) => {
    const ret = args[Symbol.for("BlockArgThen")]()
    return ret;
  },
  BlockArgElse: ({ }, { args }) => args[Symbol.for("BlockArgElse")](),
  assign_arg:({name,value},{setArg,Nbt}) => {
    setArg(name,Nbt(value));
    return "";
  },
  FunctionCall:({resloc }, { T }) =>  `function ${T(resloc)}`,
  MacroCall:(
      {ns, name, args, then, otherwise }, 
      { T, Nbt, macroExists, expandMacro, getMacro, ns:NS }
    ) => {
      if (!macroExists(ns,name) && !args && !then && !otherwise) {
        return `function ${ns||NS}:${name}`;
      }
      assert(macroExists(ns,name),`no such macro ${ns||NS}:${name}`)
    const macro = getMacro(ns,name);
    const new_args = {};
    const { named={}, numbered=[] } = args||{};
    for (const i in macro.args) {
      const { name, def } = macro.args[i];
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
    const thenCode = new_args[Symbol.for("BlockArgThen")] = () => then ? T(then) : ""
    const elseCode = new_args[Symbol.for("BlockArgElse")] = () => otherwise ? T(otherwise) : ""
    return "function " + expandMacro(ns,name, new_args).resloc
  },
  arg:({name}, { getArg }) => getArg(name)
}
