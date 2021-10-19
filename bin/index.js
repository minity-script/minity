#!/usr/bin/env node

const {
  writeFileSync: writeFile,
  readFileSync: readFile,
  statSync,
  lstatSync,
  mkdirSync: mkdir,
  readdirSync: readdir,
  cpSync: cp,
  existsSync: exists,
  symlinkSync: symlink,
  unlinkSync: unlink,
  copyFileSync: copyFile
} = require("fs");
const stat = (path,options) => statSync(path,{throwIfNoEntry:false,...options})
const lstat = (path,options) => lstatSync(path,{throwIfNoEntry:false,...options})

const { resolve, relative, absolute, basename, dirname } = require("path");
const assert = require("assert");
const { spawnSync: spawn, spawnSync, execSync } = require('child_process');
const watch = require('node-watch');
const {walk,Builder} = require("./Builder");
const prompt = require('inquirer').createPromptModule();



const CLI = {
  async doCmd() {
    const {
      _: [cmd, ...args],
      target,
      world,
      simulate,
      debug,
      force
    } = require('minimist')(process.argv.slice(2),{
      boolean:['debug',"simulate","force"],
      alias:{
        target: "t",
        world: "w",
        debug: "d",
        simulate: "s",
        force: "f"
      }
    });

    if (!CLI.commands[cmd]) {
      await CLI.commands.usage();
    } else {
      try {
        await CLI.commands[cmd](args, { target, world, simulate, debug, force });
      } catch (error) {
        console.error(debug ? error : String(error));
        console.error("Exiting.")
        process.exit(-1)
      }
    }
  },
  async chooseMinecraftWorld(target) {
    const path = resolve(CLI.minecraftPath,"saves");
    const entries = readdir(path,{withFileTypes:true});
    const worlds = []
    for (const entry of entries) {
      if (entry.isDirectory()) {
        worlds.push({
          name:entry.name,
          value:resolve(path,entry.name),
          short:resolve(path,entry.name),
        })
      }
    }
    return (await prompt([{
      message: "Choose the Minecraft world to link",
      type: "list",
      choices: worlds,
      name: "world"
    }])).world   
  },
  async chooseExample(target) {
    const path = resolve(__dirname,"..","examples");
    const entries = readdir(path,{withFileTypes:true});
    const examples = []
    for (const entry of entries) {
      if (entry.isDirectory()) {
        examples.push({
          name:entry.name,
          value:resolve(path,entry.name),
          short:resolve(path,entry.name),
        })
      }
    }
    return (await prompt([{
      message: "Choose the example to create in "+target,
      type: "list",
      choices: examples,
      name: "example"
    }])).example  
  },
  get minecraftPath() {
    if (process.env.APPDATA) return resolve(process.env.HOME, "Library", "Application Support", "minecraft");
    if (process.platform == 'darwin') return resolve(process.env.HOME, "Library", "Application Support", "minecraft");
    return resolve(process.env.HOME, '.minecraft');
  },
  resolveSource(dir) {
    return find(resolve(".",dir));
    function find(cur) {
      const file = resolve(cur,"mclang.json");
      if (stat(file)?.isFile()) {
        return cur
      }
      const parent = resolve(cur,"..")
      if (parent === cur) return null;
      return find(parent);
    }
  },
  checkTarget(path) {
    if(!exists(path)) return true;
    if(readdir(path).length===0) return true;
    if(exists(resolve(path,".mclang.fecit"))) return true;
    throw new Error(path+" exists, but was not built by mclang");
  },
  resolveTarget(pack_name, { world, target }) {
    assert(!world || !target, "You cannot specify both --target or --world");
    if (!world && !target) return null;
    let path;
    if (target) {
      path = resolve(".", target);
    } else {
      const worldPath = resolve(CLI.minecraftPath, "saves", world);
      assert(exists(worldPath), "World " + world + " does not exist in " + resolve(CLI.minecraftPath, "saves"))
      path = resolve(worldPath,"datapacks",pack_name);
    }
    return path;
  },
  getSourceOptions(dir) {
    const source = CLI.resolveSource(dir);
    if (!source) return null;
    //assert(source,resolve(dir)+" is not inside a mclang project");
    const settings = require(resolve(source,"mclang.json"));
    const dirs = settings.directories || {}
    const defaultTarget = resolve(dir,dirs.target || "build");
    const name = settings.name || basename(source)
    return {
      sourceDirectory: source,
      name: name,
      description: settings.description ?? name,
      entryPoint: resolve(source,settings.main || "src/index.html"),
      filesDirectories: [].concat(dirs.files||"files").map(d=>resolve(source,d)),
      watchDirectories: [].concat(dirs.watch||["files","src"]).map(d=>resolve(source,d)),
      defaultTarget,
    };
  },
  getBuildOptions(dir,{world,target,debug=false}) {
    const options = CLI.getSourceOptions(dir);
    assert(options, resolve(dir)+" is not within a mclang project");
    options.targetDirectory = CLI.resolveTarget(options.name,{world,target}) || options.defaultTarget
    options.debug=debug;
    return options;
  },
  getCreateOptions(dir,options={}) {
    let abs = resolve(".", dir);
    const name = basename(abs);
    let entry = stat(abs, { throwIfNoEntry: false });
    if (entry) {
      assert(entry.isDirectory(), `Path ${abs} exists but is not a directory.`);
      let entries = readdir(abs);
      assert(entries.length == 0, `Path ${abs} is not empty`);
    }
    return {createDirectory:abs,projectName:basename(abs)}
  },
  doBuild(options) {
    try {
      CLI.checkTarget(options.targetDirectory)
      Builder.build(options);
    } catch (error) {
      if (error.location) {
        console.log(String(error),"\n  at",error.file+":"+error.location.start.line+":"+error.location.start.column);
        if (options.debug) console.log(error)
      } else throw(error);
    }
  },
  commands: {
    create([dir = "."], options) {
      let {createDirectory,projectName} = CLI.getCreateOptions(dir,options);
      const {simulate} = options;
      if (!simulate) {
        mkdir(createDirectory, { recursive: true });
        const files = walk(resolve(__dirname, "starter"));
        for (const file of files) {
          const input = readFile(file.path,{encoding:"utf8"});
          const output = input.replace(/###PACK###/g,projectName);
          const target = resolve(createDirectory,file.rel);
          mkdir(dirname(target),{recursive:true})
          writeFile(target,output,{encoding:"utf8"})
        }
        console.log('Created a fresh mclang project in', createDirectory);
      } else {
        console.log('Would create a fresh mclang project in', createDirectory);
      }
    },
    async example([dir="."],options) {
      let {createDirectory} = CLI.getCreateOptions(dir,options);
      let example = await CLI.chooseExample(createDirectory);
      if (!example) throw new Error("Nothing chosen.")
      console.log("copying example",basename(example),"to",createDirectory)
      mkdir(createDirectory, { recursive: true });  
      const files = walk(example);
      for (const file of files) {
        const target = resolve(createDirectory,file.rel);
        mkdir(dirname(target),{recursive:true})
        copyFile(file.path,target)
      }
      console.log("Done.")
    },
    async options([dir="."],options) {
      console.log(JSON.stringify(CLI.getBuildOptions(dir,options),null,2));
    },
    async link([dir="."],{world,target,force,...rest}) {
      if (!world && !target || world===true) {
        world = await CLI.chooseMinecraftWorld();
      }
      if (!world) throw new Error("Nothing chosen.")
      const {targetDirectory,defaultTarget} = CLI.getBuildOptions(dir,{world,target,...rest});
      const pack = CLI.resolveSource(targetDirectory);
      assert(!pack,targetDirectory+" is within a mclang project, will not link");
      const targetEntry = lstat(targetDirectory);
      if (targetEntry) {
        assert(targetEntry.isSymbolicLink(), targetDirectory + " exists and is not a link. Will not overwrite.")
        assert(force,targetDirectory+" exists, use --force to overwrite.")
        unlink(targetDirectory);
      }
      //console.log({force,targetDirectory,defaultTarget})
      symlink(defaultTarget,targetDirectory);
    },
    async build([dir = "."], options) {
      const buildOptions = CLI.getBuildOptions(dir, options);
      CLI.doBuild(buildOptions);
    },
    async watch([dir = "."], options) {
      const buildOptions = CLI.getBuildOptions(dir, options);
      for (const path of buildOptions.watchDirectories) {
        watch(path, {
          persistent: true,
          recursive:true
        },build);
      }
      build();
      function build () {
        CLI.doBuild(buildOptions);
        console.log("Waiting for change ...")
      }
    },
    usage() {
      console.log(
        "Usage:\n",
        "mclang create [project_dir]\n",
        "mclang example [project_dir]\n",
        "mclang link [source_dir]\n",
        "mclang build [source_dir]\n",
        "mclang watch [source_dir]\n",
        "mclang (build|watch) [source_dir] --target=target_dir\n",
        "mclang (build|watch) [source_dir] --world=target_world",
      )
    }
  }
}
CLI.doCmd()

