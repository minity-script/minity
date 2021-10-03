const { readFileSync, readdirSync, statSync, rmSync, writeFileSync, cpSync, mkdirSync } = require("fs");
const mcl = require("./mcl.js");
const { relative, dirname, basename, resolve, extname } = require("path");
const { merge } = require("merge");
const { Result } = require("./Result");

exports.Builder = class Builder {

  static scan(from, to) {
    const builder = new Builder(from, to);
    builder.scan();
    return builder.input;
  }

  static prepare(from, to) {
    const builder = new Builder(from, to);
    builder.scan();
    builder.prepare();
    const { input, output } = builder
    return { input, output };
  }

  static build(from, to) {
    const builder = new Builder(from, to);
    return builder.build();
  }


  input = {
    json: [],
    mcl: [],
    other: []
  }

  output = {
    json: {},
    mcfunction: {},
    other: {},
    constants: {}
  }

  result = new Result;

  constructor(from, to) {
    this.from = resolve(".", from);
    this.to = resolve(".", to);
  }

  scan(cur = this.from) {
    const entries = readdirSync(cur, { withFileTypes: true });
    for (const entry of entries) {
      const path = resolve(cur, entry.name);
      const rel = relative(this.from, path)
      if (entry.isFile()) {
        if (extname(path) === '.mcl') {
          this.input.mcl.push({ rel, path });
        } else if (extname(path) === '.json') {
          this.input.json.push({ rel, path });
        } else {
          this.input.other.push({ rel, path });
        }
      } else if (entry.isDirectory()) {
        const sub = resolve(path, entry.name);
        this.scan(sub)
      }
    }
  }
  mergeJson(dest,obj) {
    const {output}=this;
    if (output.json[dest]) {
      output.json[dest] = merge(output.json[dest], obj)
    } else {
      output.json[dest] = obj
    }
  }

  compileMclFile(path) {
    try {
      const text = readFileSync(path, { encoding: "utf8" });
      return mcl.compile(text,this.result);
    } catch (e) {
      console.log(e.message||e);
      if (e.location) {
        const { message, location: { start: { line, column } } } = e;
        console.log(`  at ${path}:${line}:${column}`)
      }
      throw new Error("exit");
    }
  }

  prepare() {
    const { input, output } = this;
    for (const { rel, path } of input.other) {
      const dest = resolve(this.to, rel);
      output.other[dest] = path;
    }
    for (const { rel, path } of input.json) {
      const dest = resolve(this.to, "data", rel);
      output.json[dest] = require(path);
    }
    for (const { rel, path } of input.mcl) {
      this.compileMclFile(path);
    }
  }

  build() {
    this.scan();
    this.prepare();
    this.write();
    return this.output;
  }

  write() {
    const {from,to,output} = this;
    if(this.checkTo()) {
      rmSync(to, { recursive: true });
    };
    mkdirSync(to,{recursive:true});
    writeFileSync(resolve(to, ".mcl.fecit"), "", { encoding: "utf8" })
    for (const dest in output.other) {
      const path = output.other[dest];
      console.log('copying', relative(from, path))
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(path, dest);
    }
    for (const file of this.result.files) {
      console.log("writing",file.dest);
      file.write(to);
    }
  }

  checkTo() {
    const { to } = this;
    const entry = statSync(to, { throwIfNoEntry: false });
    if (!entry) return false;
    if (!entry.isDirectory()) {
      throw new Error("Destination exists, but is not a directory: " + to)
    };
    const isMclDirectory = !!statSync(resolve(to, ".mcl.fecit"), { throwIfNoEntry: false });
    if (!isMclDirectory) {
      throw new Error("Destination exists, but was not built with mcl: " + to)
    };
    return true;
  }
}
