
const { assert } = require("console");
const fs = require("fs");
const peggy = require("peggy");

const grammar = fs.readFileSync(__dirname + "/mcl.pegjs", { encoding: "utf8" });
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
      parser.parse(text);
      return false;
    } catch (error) {
      return error;
    }
  },
  transform(tree, {result= new Result()}) {
    const root = new Frame.Root({result});
    root.transform(tree);
    return root.result;
  },
  compile(text, {result,...rest} ) {
    const tree = mclang.parse(text,{
      ...rest,
      N: (...args) => {
        const node = new TreeNode(...args);
        return node;
      }
    })
    const ret = mclang.transform(tree,{result});
    return ret;
  }
}
