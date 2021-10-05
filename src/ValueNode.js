const ValueNode = exports.ValueNode = class ValueNode  {
  $ = "VALUE";
  static cast = value => value

  static fromLiteral(node,frame) {
    return this.types[node.type].doFromLiteral(node,frame);
  }

  static fromValueNode(node, type = node.type) {
    if (!this.types[node.type]) {
      process.exit(1)
    }
    return this.types[node.type].doFromValueNode(node, type);
  }

  static doFromLiteral(node,frame) {
    return new this(node,frame)
  }
  static doFromValueNode(node, type) {
    return new this({ ...node, type })
  }

  constructor({ type, value, location }) {
    this.type = type;
    this.location = location;
    this.value = this.constructor.cast(value);
  }
  convert = type => this.constructor.fromValueNode(this, type)

  format = () => JSON.stringify(this.value)
  toString() {
    return this.format()
  }
  static types = {}

  transform = ()=>this
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

ValueNode.types.int = ValueNode.Int = class ValueInt extends ValueNode.Number {
  static cast = value => value | 0;
}

ValueNode.types.array = ValueNode.Array = class ValueArray extends ValueNode {
  static cast = value => [].concat(value);

  static doFromLiteral({ items, ...rest },{T}) {
    return super.doFromLiteral({
      items: items.map(T),
      ...rest
    })
  }
  constructor({ items, ...rest }) {
    super(rest);
    this.items = items;
    this.value = items.map(it => it.value)
  }
  format = () => {
    return "[" + this.items.map(it => it.format()).join(',') + "]"
  }
}

ValueNode.types.template = ValueNode.Template = class ValueTemplate extends ValueNode.String {
  static cast = value => String(value);

  static doFromLiteral({ value, ...rest },{T}) {
    return super.doFromLiteral({
      value: T(value),
      ...rest
    })
  }
}


ValueNode.types.object = ValueNode.Object = class ValueObject extends ValueNode {
  static cast = value => Object.assign({}, value);

  static doFromLiteral({ members, ...rest },{T}) {
    return super.doFromLiteral({
      members: members.map(it => {
        return { name: T(it.name), value: T(it.value) }
      }),
      ...rest
    })
  }
  constructor({ members, ...rest }) {
    super(rest);
    this.members = members;
    this.value = {};
    for (const { name, value } of members) {
      this.value[name.value] = value.value;
    }
  }
  format = () => {
    return "{" + this.members.map(it => it.name.format() + ":" + it.value.format()).join(',') + "}"
  }
}

ValueNode.types.string_json = ValueNode.StringJson = class ValueStringJson extends ValueNode {

  static doFromLiteral({ value, ...rest },{T}) {
    return super.doFromLiteral({
      value: T(value).value,
      ...rest
    })
  }
  format = () => {
    return "'"+JSON.stringify(this.value).replace(/(['\\])/g,"\\$1") + "'"
  }
}
