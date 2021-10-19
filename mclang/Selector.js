exports.Selector = class SelectorSpec {
  includes = {}
  excludes = {}
  scores = {}
  initial = "e";

  limit = null

  constructor(initial) {
    if (initial.length > 1) {
      this.initial = "e";
      this.include("type", initial)
    } else {
      this.initial = initial;
    }
  }

  get isSingle() {
    return this.limit === 1 || this.initial.match(/[psr]/)
  }

  include(key, cond) {
    switch (key) {
      case "limit":
        this.limit = cond
      case "x": case "dx":
      case "y": case "dy":
      case "z": case "dz":
      case "x_rotation":
      case "y_rotation":
      case "distance":
      case "type":
      case "sort":
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

exports.SelectorUUID = class SelectorUUID {
  constructor(uuid) {
    this.uuid = uuid
  }

  get isSingle() {
    return true
  }
  format() {
    return JSON.stringify(this.uuid);
  }    
}