const IS_NBT = Symbol()
const TO_NBT = Symbol()
const TO_JSON = Symbol()
const IS_JSON = Symbol()

const Nbt = exports.Nbt = function Nbt(value,...args) {
  if (Nbt.isNbt(value)) return value;
  if (typeof value === 'boolean') {
    return new NbtBoolean(value,...args);
  }
  if (typeof value === 'number') {
    return new NbtNumber(value,...args);
  }
  if (typeof value === 'string') {
    return new NbtString(value,...args);
  }
  if (Array.isArray(value)) {
    return new NbtList(value,...args);
  }
  if (typeof value === 'object') {
    return new NbtCompound(value,...args);
  }
  console.log("bad value", value,...args)
  debugger;
  throw new Error("bad nbt value")
}
Nbt.isNbt = value => {
  //console.log("is", value)
	return (value ?? false) && !!value[IS_NBT];
}

Nbt.toNbt = value => {

	return Nbt(value)[TO_NBT]();
}
Nbt.toSnbt = value => {
	return (
  	"'" 
    + Nbt(value)[TO_NBT]().replace(/[\\']/g, c=>"\\"+c) 
    + "'"
  );
}
Nbt.toJson = value => {
return JSON.stringify(Nbt(value));
return (
  	"'" 
		+ JSON.stringify(Nbt(value)).split(/([^'\\]+|\\.|')/).map(t=>t=="'"?"\\'":t).join("")
    + "'"
  );
}

class NbtNumber extends Number {
	[IS_NBT]=true;
  [TO_NBT]() {
  	return this + (this.suffix||"")
  } 
	constructor(value,suffix) {
  	super(value);
    this.suffix = suffix
  }
}

class NbtString extends String {
  constructor(value,json) {
    super(value)
    if (json) this[IS_JSON] = true;
  }
  [TO_NBT]() {
    if(this[IS_JSON]) return (
      "'" 
      + this.replace(/(['\\])/g,'\\$1')
      + "'"
    );
  	return JSON.stringify(this);
  } 
	[IS_NBT] = true;
}

class NbtBoolean extends Boolean {
  [TO_NBT]() {
  	return JSON.stringify(this);
  } 
	[IS_NBT] = true;
}


class NbtCompound{
	[IS_NBT]=true;
  [TO_NBT]() {
  	let ret =[];
    for (let id in this) {
    	let key = (!id.match(/^[a-z_]\w*$/i)) ? JSON.stringify(id) : id;
      //if (typeof this[id] === "undefined") console.log("UNDEFINED",id,JSON.stringify(this))
    	ret.push(key +":"+ Nbt.toNbt(this[id]))
    }
    return "{"+ret.join(',')+"}";
  } 
	constructor(value) {
    let proxy = new Proxy(this,{
    	set:(obj, prop, value) => {
    		obj[prop] = Nbt(value)
        return true;
      }
    })
    for (const id in value) {
      this[id] = Nbt(value[id]);
    }
    return proxy;
  }
}

class NbtList extends Array {
	[IS_NBT]=true;
  [TO_NBT]() {
  	let ret =[];
    for (let id in this) {
    	ret.push(Nbt.toNbt(this[id]))
    }
    return "["+ret.join(',')+"]";
  } 
	constructor(value) {
  	super();
  	let mine = {};
    for (const id in value) {
    	this[id] = Nbt(value[id])
    }
    return new Proxy(this,{
    	set:(obj, prop, value) => {
    		obj[prop] = Nbt(value)
        return true;
      }
    })
  }
}

