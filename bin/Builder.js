const { readFileSync, readdirSync, statSync, rmSync, writeFileSync, cpSync, mkdirSync } = require("fs");
const { relative, dirname, basename, resolve, extname } = require("path");
const { mergeAndConcat:merge } =require('merge-anything');

const minity = require("../minity");
const { Result } = require("../minity/Result");

exports.Builder = class Builder {

  static scan(options) {
    const builder = new Builder(options);
    builder.scan();
    return builder.input;
  }

  static prepare(options) {
    const builder = new Builder(options);
    builder.scan();
    builder.prepare();
    const { input, output } = builder
    return { input, output };
  }

  static build(options) {
    const builder = new Builder(options);
    return builder.build();
  }


  input = {
    json: [],
    other: []
  }

  output = {
    json: {},
    mcfunction: {},
    other: {},
    constants: {}
  }

  result = new Result;

  constructor({ sourceDirectory, entryPoint, filesDirectories, targetDirectory }) {
    this.sourceDirectory = sourceDirectory;
    this.entryPoint = entryPoint;
    this.filesDirectories = filesDirectories;
    this.targetDirectory = targetDirectory
  }

  scan() {
    for (const path of this.filesDirectories) {
      const files = walk(path);
      for (const { path, rel, extension } of files) {
        if (extension === '.json') {
          this.input.json.push({ rel, path });
        } else {
          this.input.other.push({ rel, path });
        }
      }
    }
  }

  mergeJson(dest, obj) {
    const { output } = this;
    if (output.json[dest]) {
      output.json[dest] = merge(output.json[dest], obj)
    } else {
      output.json[dest] = obj
    }
  }


  prepare() {
    const { input, output } = this;
    for (const { rel, path } of input.other) {
      const dest = resolve(this.targetDirectory, rel);
      output.other[dest] = path;
    }
    for (const { rel, path } of input.json) {
      const dest = resolve(this.targetDirectory, "data", rel);
      output.json[dest] = require(path);
    }
    minity.compileFile(this.entryPoint, { result: this.result });
    console.log("Compiled.")
  }

  build() {
    this.scan();
    this.prepare();
    this.write();
    return this.output;
  }

  write() {
    const { targetDirectory, sourceDirectory, output } = this;
    if (this.checkTo()) {
      rmSync(targetDirectory, { recursive: true });
    };
    mkdirSync(targetDirectory, { recursive: true });
    writeFileSync(resolve(targetDirectory, ".minity.fecit"), "", { encoding: "utf8" })
    for (const dest in output.other) {
      const path = output.other[dest];
      console.log('copying', relative(sourceDirectory, path))
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(path, dest);
    }
    for (const file of this.result.files) {
      console.log("writing", resolve(targetDirectory, file.dest));
      file.write(targetDirectory);
    }
  }

  checkTo() {
    const { targetDirectory } = this;
    const entry = statSync(targetDirectory, { throwIfNoEntry: false });
    if (!entry) return false;
    if (!entry.isDirectory()) {
      throw new Error("Destination exists, but is not a directory: " + targetDirectory)
    };
    const isMclDirectory = !!statSync(resolve(targetDirectory, ".minity.fecit"), { throwIfNoEntry: false });
    if (!isMclDirectory) {
      throw new Error("Destination exists, but was not built with minity: " + targetDirectory)
    };
    return true;
  }
}

const walk = exports.walk = function walk(dir, cur = dir) {
  var ret = [];
  const entries = readdirSync(cur, { withFileTypes: true });
  for (const entry of entries) {
    const path = resolve(cur, entry.name);
    if (entry.isFile()) {
      ret.push({
        path,
        rel: relative(dir, path),
        extension: extname(path),
        directory: dirname(path)
      })
    } else if (entry.isDirectory()) {
      ret = [...ret, ...walk(dir, path)]
    }
  }
  return ret;
}