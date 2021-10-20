
const { assert } = require("console");
const {readFileSync} = require("fs");
const peggy = require("peggy");

const grammar = readFileSync(__dirname + "/mclang.pegjs", { encoding: "utf8" });
const parser = peggy.generate(grammar);
const { TreeNode } = require("./TreeNode");
const { Frame } = require("./Frame");
const { Result } = require("./Result");

const mclang = module.exports = {
  parse(text,options={}) {
    const ret =  parser.parse(text,options);
    return ret;
  },
  findError(text) {
    try {
      mclang.compile(text,{});
      return false;
    } catch (error) {
      return error;
    }
  },
  transform(tree, {result= new Result(),...rest}) {
    const root = new Frame.Root({result,...rest});
    root.transform(tree);
    return root.result;
  },
  compile(text, {...rest} ) {
    const tree = mclang.parse(text,{
      ...rest,
      N: (...args) => {
        const node = new TreeNode(...args);
        return node;
      }
    })
    const ret = mclang.transform(tree,{...rest});
    return ret;
  },
  compileFile(file,{...rest}) {
    try {
      const text = readFileSync(file, { encoding: "utf8" });
      return mclang.compile(text,{file,...rest});
    } catch (e) {
      e.file ??= file;
      throw(e);
    }
  }
}
