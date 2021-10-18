class MclError extends Error {
  constructor(message, location) {
    super(message);
    this.location = location;
  }
}

const {transformers} = require("./nodeTransformers");

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
