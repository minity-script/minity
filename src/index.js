const optant = require('optant');
const { readFileSync, readdirSync, statSync, rmSync, writeFileSync, cpSync, mkdirSync } = require("fs");
const mcl = require("./mcl.js");
const { relative, dirname, basename, resolve, extname } = require("path");

optant(([
  cmd,
  source,
  dest
], {
  h, help = h,
  v, version = v
}) => {

  // version = --version or -v
  if (version) return require("/../package.json").version;

  // help = --help or -h
  if (help || h || !['parse', 'compile', 'build'].includes(cmd) || !source) return "Usage: mcl (parse|compile|build) <source> <dest>";

  switch (cmd) {
    case 'build':
      build(source,dest)
      break;
  }
});


function checkDest(to) {
    const entry = statSync(to,{throwIfNoEntry:false});
    if (!entry) return true;
    if (!entry.isDirectory()) {
      console.error("Destination exists, but is not a directory: "+to)
      process.exit(1);
    };
    const isMclDirectory = !!statSync(resolve(to,".mcl.built.this"),{throwIfNoEntry:false});
    if (!isMclDirectory) {
      console.error("Destination exists, but was not built with mcl: "+to)
      process.exit(1);
    };
    rmSync(to,{recursive:true})
}

function build(from,to) {
  from = resolve(from);
  try {
    to = to || resolve(from,"build",basename(from));
    checkDest(to);
    console.log("Building",from,"->",to)
    mkdirSync(to,{recursive:true})
    writeFileSync(resolve(to,".mcl.built.this"),"",{encoding:"utf8"})
    buildDir(from,to);
  } catch(e) {
    console.log('caught');
    console.error(e);
  }
  
}

function buildDir(from,to=from+"/build",cur=from) {
 
  if(cur==to) return;
  const entries = readdirSync(cur,{withFileTypes:true});
  for (const entry of entries) {
    const path = resolve(cur,entry.name);
    if (entry.isFile()) {
      if (extname(path)==='.mcl') { 
        const input = readFileSync(path,{encoding:"utf8"});
        const output = mcl.compile(input,basename(path,".mcl"));
        for (const target in output) {
          const dest = resolve(to,target);
          console.log('writing',path,"->",dest)
          mkdirSync(dirname(dest),{recursive:true});
          writeFileSync(dest,output[target].join("\n"),{encoding:"utf8"})
        }
      } else {
        const src = relative(from,path);
        const dest = resolve(to,src);
        console.log('copying',path,"->",dest)
        mkdirSync(dirname(dest),{recursive:true});
        cpSync(path,dest);
      }
    } else if (entry.isDirectory()) {
      buildDir(from,to,path)
    }
  }
}
