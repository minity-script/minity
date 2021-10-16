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
      throw new MclError("no transformer for " + this.$, this.location);
    }
  }
  transform = (frame, ...args) => {
    try {
      return this.transformer(this, frame, ...args)
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
  import: ({ file }, { importFile, Nbt }) => {
    importFile(Nbt(file));
  },
  DeclareNamespace: ({ ns, globals }, { T, declareNamespace }) => {
    const fn = declareNamespace(ns, globals);
    fn.addTag("minecraft", "load");
    return "";
  },
  DeclareFunction: ({ name, tags, statements }, { T, declareFunction }) => {
    const fn = declareFunction(name, statements);
    for (const { ns, name } of tags) {
      fn.addTag(T(ns), T(name));
    }
    return "# function " + fn.resloc;
  },
  CallSelf: ({ }, { resloc }) => "function " + resloc,
  macro(node, { T, macros }) {
    macros[node.name] = node;
    return "";
  },
  string_lit: ({ value }, { Nbt }) => Nbt(String(value)),
  number_lit: ({ value, suffix }, { Nbt }) => Nbt(+value, suffix),
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
  string_json: ({ value }, { toJson }) => toJson(value),
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
  selector: ({ initial, conditions }, { T, toNbt }) => {
    var spec = T(initial);
    console.log(spec.format(), spec)
    for (const c of conditions) T(c, { spec });
    return spec.format();
  },
  selector_initial: ({ initial }) => new SelectorSpec(initial),
  selector_initial_type: ({ type }, { T }) => new SelectorSpec(T(type)),
  cond_brackets: ({ name, op, value }, { T }, { spec }) => {
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
  cmd_summon: ({ pos, type, nbt, then }, { T, anonFunction, Nbt, toNbt }) => {
    if (!then) return `summon ${pos ? T(pos) : "~ ~ ~"} ${T(type)}${nbt ? toNbt(nbt) : ''}`

    nbt = Nbt(nbt || {});
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
    return `give ${T(selector)} ${T(type)}${toNbt(nbt || {})}`
  },
  cmd_after: ({ time, unit, fn }, { T, toNbt }) => {
    return `schedule ${T(fn)} ${toNbt(time)}${unit}`
  },

  cmd_setblock: ({ pos, block }, { T }) => {
    return `setblock ${pos ? T(pos) : "~ ~ ~"} ${T(block)}`
  },

  function_call({ resloc }, { T, ns }) {
    return "function " + T(resloc);
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
  datapath_modify_datapath: ({ modify, left, right }, { T }) => `data modify ${T(left)} ${modify} from ${T(right)}`,
  datapath_modify_value: ({ modify, left, right }, { T }) => `data modify ${T(left)} ${modify} value ${T(right)}`,
  datapath_modify_execute: ({ modify, left, right }, { T, addBlock }) => "function " + addBlock([
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
    return { text: "" + toNbt(value) }
  },
  print_space: () => {
    return { text: " " }
  },
  delete_datapath: ({ path }, { T }) => `data remove ${T(path)}`,
  template_chars: ({ chars }) => chars,
  template_parts: ({ parts }, { T }) => parts.map(T).join(""),
  template_expand_arg: ({ name }, { toNbt, Nbt, args }) => Nbt(args[Nbt(name)]),
  template_expand_tag: ({ name }, { T, tagId }) => tagId(T(name)),
  template_expand_var: ({ name }, { T, varId }) => varId(T(name)),
  template_expand_score: ({ name }, { T, scoreId }) => scoreId(T(name)),
  template_expand_selector: ({ name }, { T, scoreId }) => T(selector),
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
  assign_store_scoreboard: ({ id }, { T }) => `score ${T(id)}`,
  assign_store_datapath: ({ path }, { T }) => `data ${T(id)}`,
  assign_store_bossbar: ({ id }, { T }) => `bossbar ${T(id)} ${prop}`,
  assign_run_scoreboard: ({ id }, { T }) => `scoreboard players get ${T(id)}`,
  assign_store_datapath: ({ path }, { T }) => `data get ${T(path)}`,
  assign_store_bossbar: ({ id }, { T }) => `bossbar get ${T(id)} ${prop}`,

  test_entity: ({ selector }, { T }) => `entity ${T(selector)}`,
  test_datapath: ({ path }, { T }) => `data ${T(path)}`,
  test_scoreboard: ({ left, op, right }, { T }) => `score ${T(left)} ${op} ${T(right)}`,
  test_scoreboard_true: ({ left }, { T }) => `score ${T(left)} matches 1..`,
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
  raw_tag: ({ props, attr, parts, block, paragraph }, { Nbt, toNbt }) => {
    const ret = Nbt({ ...props })
    for (const { name, value } of attr) {
      ret[Nbt(name)] = Nbt(value);
    }
    ret.text ??= "";
    if (parts) ret.extra = parts.map(Nbt)
    return Nbt(ret);

  },
  raw_chars: ({ chars }, { Nbt }) => Nbt(chars),
  mod_check_if: ({ test }, { T }) => `if ${T(test)}`,
  mod_check_unless: ({ test }, { T }) => `unless ${T(test)}`,
  mod_checks: ({ checks }, { T }) => checks.map(T).join(" "),

  every_until: ({ statements, test, time, unit }, { T, Nbt, addBlock }) => {
    const lines = statements.map(T);
    const block = addBlock(lines);
    block._content.push(`execute unless ${T(test)} run schedule function ${block.resloc} ${Nbt(time)}${unit}`)
    return "function " + block.resloc;
  },

  /************************************************************************* */
  Execution: ({ modifiers, executable }, { T }) => `execute ${modifiers.map(T).join(" ")} ${T(executable)}`,
  Executable: ({ last }, { T }) => `run ${T(last)}`,

  ModifierNative: ({ MOD, arg }, { T }) => `${MOD} ${T(arg)}`,
  ModifierNativeLiteral: ({ MOD, ARG }, { T }) => `${MOD} ${ARG}`,
  ModifierFor: ({ arg }, { T }) => `as ${T(arg)} at @s`,
  StructureIfElse: ({ arg, then, otherwise }, { T, ifElse }) => (
    otherwise
      ? ifElse(T(arg), T(then), T(otherwise))
      : `execute ${T(arg)} ${T(then)}`
  ),
  Conditionals: ({ subs }, { T }) => subs.map(T).join(" "),
  ConditionalIf: ({ arg }, { T }) => `if ${T(arg)}`,
  ConditionalUnless: ({ arg }, { T }) => `unless ${T(arg)}`,

  CodeBlock: ({ statements }, { T, addBlock }) => {
    if (statements.length == 1) return T(statements[0]);
    return "function " + addBlock(statements.map(T)).resloc;
  },
  AnonFunction: ({ statements }, { T, anonFunction }) => {
    return anonFunction(statements.map(T));
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
  TildeCoord: ({ arg }, { T }) => `~${T(arg)}`,
  CaretCoord: ({ arg }, { T }) => `^${T(arg)}`,
  StructureRepeat: ({ mods, statements, conds, then }, { T, addBlock, ns }) => {

    const MODS = mods.map(T).join(" ");
    const CONDS = T(conds);
    if (!then) {
      const block = addBlock(lines);
      block._content.push(`execute unless ${CONDS} ${MODS} run function ${block.resloc}`)
      return "function " + block.resloc;
    } else {
      const stack = `storage zzz_mcl:${ns} stack`;
      return "function " + addBlock([
        `execute ${MODS} run function ` + addBlock([
          ...(statements || []).map(T),
          `data modify ${stack} append value [B;]`,
          `execute ${CONDS} run data modify ${stack}[-1] append value 1b`,
          `execute unless data ${stack}[-1][0] ${T(then)}`,
          [`execute if data ${stack}[-1][0] ${MODS} run `, Symbol.for("callSelf")],
          `data remove ${stack}[-1]`
        ]),
      ])
    }
  },
  BlockArgThen: ({ }, { args }) => {
    const ret = args[Symbol.for("BlockArgThen")]()
    console.log("THEN", ret)
    return ret;
  },
  BlockArgElse: ({ }, { args }) => args[Symbol.for("BlockArgElse")](),
  macro_call({ name, args, then, otherwise }, { T, Nbt, expandMacro, macros }) {
    const macro = macros[name];
    const new_args = {};
    for (const i in macro.args) {
      const { name, def } = macro.args[i];
      const { named, numbered } = args;
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
    return "function " + expandMacro(name, new_args).resloc
  },
  arg(node, { args, Nbt }) {
    return args[node.name];
  },
}

class SelectorSpec {
  includes = {}
  excludes = {}
  scores = {}
  initial = "e";


  constructor(initial) {
    if (initial.length > 1) {
      this.initial = e;
      this.include("type", initial)
    } else {
      this.initial = initial;
    }
  }

  include(key, cond) {
    switch (key) {
      case "x": case "dx":
      case "y": case "dy":
      case "z": case "dz":
      case "x_rotation":
      case "y_rotation":
      case "distance":
      case "type":
      case "sort":
      case "limit":
      case "team":
      case "level":
      case "gamemode":
      case "name":
      case "advancements":
        if (key in this.includes) throw new MclError("cannot duplicate " + key + "=");
      case "nbt":
      case "tag":
      case "predicate":
        this.includes[key] ??= []
        this.includes[key].push(cond);
        break;
      default:
        throw new MclError("cannot use " + key + "=");
    }
  }
  score(key, cond) {
    if (key in this.scores) throw new MclError("cannot duplicate score " + key);
    this.scores[key] = cond;
  }
  exclude(key, cond) {
    switch (key) {
      case "name":
      case "nbt":
      case "type":
      case "tag":
      case "team":
      case "gamemode":
      case "predicate":
        this.excludes[key] ??= []
        this.excludes[key].push(cond);
        break;
      default:
        throw new MclError("cannot use " + key + "=!");
    }
  }
  format() {
    const conditions = [];
    const { initial, includes, excludes, scores } = this;
    for (const key in includes) {
      conditions.push(`${key}=${includes[key]}`)
    }
    for (const key in excludes) {
      conditions.push(`${key}=!${excludes[key]}`)
    }
    if (Object.keys(scores).length > 0) {
      const parts = [];
      for (const key in scores) {
        parts.push(`${key}=${scores[key]}`)
      }
      conditions.push(`scores={${parts.join(",")}}`)
    }
    if (conditions.length === 0) return `@${initial}`;
    return `@${initial}[${conditions.join(",")}]`
  }
}