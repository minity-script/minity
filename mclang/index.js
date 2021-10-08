
const { assert } = require("console");
const fs = require("fs");
const peggy = require("peggy");

const grammar = fs.readFileSync(__dirname + "/mcl.pegjs", { encoding: "utf8" });
const parser = peggy.generate(grammar);
const { TreeNode } = require("./TreeNode");
const { Frame } = require("./Frame");
const { Result } = require("./Result");

const mcl = module.exports = {
  parse(text) {
    const ret =  parser.parse(text,{
      N: (...args) => {
        const node = new TreeNode(...args);
        if (!node.transform) {
          throw "WTF";
        };
        return node;
      }
    });
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
  transform(tree, result) {
    const root = new Frame.Root({result});
    root.transform(tree);
    return root.result;
  },
  compile(text, result = new Result() ) {
    const ret = mcl.transform(mcl.parse(text), result);
    //console.log(ret);
    return ret;
  }
}
