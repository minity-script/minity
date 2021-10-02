const { Builder } = require("./Builder");
const [cmd, from, to] = process.argv.slice(2);
setInterval(() => { }, 1 << 30);
try {
  Builder.build(from,to)
} catch (e) {
  if (!e.silent) console.log(e.stack.split("\n    at").slice(0,4).join("\n    at")+"\n    ...");
}
