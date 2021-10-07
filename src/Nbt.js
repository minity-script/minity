const IS_NBT = Symbol()
const TO_NBT = Symbol()

const Nbt = exports.Nbt = function Nbt(value,...args) {
  if (value[IS_NBT]) return value;
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
  return new Nbt(value);
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
return (
  	"'" 
		+ JSON.stringify(Nbt(value))
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
  [TO_NBT]() {
  	return this;
  } 
	[IS_NBT] = true;
}

class NbtCompound {
	[IS_NBT]=true;
  [TO_NBT]() {
  	let ret =[];
    for (let id in this) {
    	if (!id.match(/^[a-z_]\w*$/i)) id = JSON.stringify(id);
    	ret.push(id +":"+ Nbt.toNbt(this[id]))
    }
    return "{"+ret.join(',')+"}";
  } 
	constructor(value) {
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
