const { Builder } = require("./Builder");
const [cmd, from, to] = process.argv.slice(2);
setInterval(() => { }, 1 << 30);
try {
  Builder.build(from,to)
} catch (e) {
  if (e.location) {
    const {source,start:{line,column}} = e.location
    console.error(
      `${e.name}: ${e.message} (${e.file}:${line}:${column})`
    )
  } 
  if (e.name!=="SyntaxError") console.error(e);
}
