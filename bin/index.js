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
  copyFileSync: copyFile,
  realpathSync: realpath
} = require("fs");
const stat = (path, options) => statSync(path, { throwIfNoEntry: false, ...options })
const lstat = (path, options) => lstatSync(path, { throwIfNoEntry: false, ...options })

const { resolve, relative, absolute, basename, dirname } = require("path");
const assert = require("assert");
const { spawnSync: spawn, spawnSync, execSync } = require('child_process');
const watch = require('node-watch');
const { utils:{walk}, Builder } = require("@minity/parser");
const chalk = require("chalk");
const prompt = require('inquirer').createPromptModule();

const inform = (...args) => {
  if (process.stdout.isTTY) {
    console.log(...args)
  }
}

const CLI = {
  async doCmd() {
    const {
      _: [cmd, ...args],
      target,
      world,
      simulate,
      debug,
      force
    } = require('minimist')(process.argv.slice(2), {
      boolean: ['debug', "simulate", "force"],
      alias: {
        target: "t",
        world: "w",
        debug: "d",
        simulate: "s",
        force: "f"
      }
    });
//    const version = require("../package.json").version;
//    inform(chalk.bold.yellow("minity v" + version))
    if (!CLI.commands[cmd]) {
      await CLI.commands.usage.exec();
    } else {
      try {
        await CLI.commands[cmd].exec(args, { target, world, simulate, debug, force });
      } catch (error) {
        console.error(debug ? error : String(error));
        console.error("Exiting.")
        process.exit(-1)
      }
    }
  },
  checkLinkTarget(link, target) {
    const pack = CLI.resolveSource(link);
    if (pack) return {
      code: "CANNOT",
      box: "-",
      explain: "Is within minity project directory.",
      format: chalk.red,
    };

    const linkEntry = lstat(link);
    if (!linkEntry) return {
      code: "CAN",
      box: " ",
      explain: "",
      format: chalk,
    };
    if (!linkEntry.isSymbolicLink()) return {
      code: "CANNOT",
      box: "-",
      explain: "Path exists, but is not a link.",
      format: chalk.red,
    };
    if (realpath(link) == target) return {
      code: "IS",
      box: "×",
      explain: "",
      format: chalk.green
    };
    return {
      code: "OTHER",
      box: "?",
      explain: "Path exists, but points to " + realpath(link),
      format: chalk.yellow
    };
  },
  async getLinkOptions(dir, { world, target, ...rest }, message, question) {
    const options = CLI.getSourceOptions(dir);
    const { name, defaultTarget } = options;
    if (!world && !target || world === true) {
      assert(process.stdin.isTTY, "Must provide --world option.");
      inform("\n! " + message + " " + chalk.bold.green(name) + " (" + defaultTarget + ")")
      world = await CLI.chooseMinecraftWorld(options, question);
      if (!world) throw new Error("Nothing chosen.")
    }
    const { targetDirectory } = CLI.getBuildOptions(dir, { world, target, ...rest });
    return { targetDirectory, defaultTarget, ...CLI.checkLinkTarget(targetDirectory, defaultTarget) };
  },

  async chooseMinecraftWorld({ name, defaultTarget }, question) {
    const path = resolve(CLI.minecraftPath, "saves");
    const entries = readdir(path, { withFileTypes: true });
    const worlds = []
    entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const linkPath = resolve(path, entry.name, "datapacks", name);
        const { box, format, explain } = CLI.checkLinkTarget(linkPath, defaultTarget)
        worlds.push({
          name: chalk.bold("[") + format.bold(box) + chalk.bold("]") + " " + format(entry.name) + " " + chalk.gray(explain),
          value: resolve(path, entry.name),
          short: entry.name,
        })

      }
    }
    return (await prompt([{
      message: question,
      type: "list",
      choices: worlds,
      name: "world",
      loop: false,
      pageSize: 12,
    }])).world
  },
  async chooseExample(target) {
    const path = resolve(__dirname, "..", "examples");
    const entries = readdir(path, { withFileTypes: true });
    const examples = []
    for (const entry of entries) {
      if (entry.isDirectory()) {
        examples.push({
          name: entry.name,
          value: resolve(path, entry.name),
          short: resolve(path, entry.name),
        })
      }
    }
    return (await prompt([{
      message: "Choose the example to create in " + target,
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
    return find(resolve(".", dir));
    function find(cur) {
      const file = resolve(cur, "minity.json");
      if (stat(file)?.isFile()) {
        return cur
      }
      const parent = resolve(cur, "..")
      if (parent === cur) return null;
      return find(parent);
    }
  },
  checkTarget(path) {
    if (!exists(path)) return true;
    if (readdir(path).length === 0) return true;
    if (exists(resolve(path, ".minity.fecit"))) return true;
    throw new Error(path + " exists, but was not built by minity");
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
      path = resolve(worldPath, "datapacks", pack_name);
    }
    return path;
  },
  getSourceOptions(dir) {
    const source = CLI.resolveSource(dir);
    assert(!!source, resolve(dir) + " is not within a minity project");
    const settings = require(resolve(source, "minity.json"));
    const dirs = settings.directories || {}
    const defaultTarget = resolve(dir, dirs.target || "build");
    const name = settings.name || basename(source)
    return {
      sourceDirectory: source,
      name: name,
      description: settings.description ?? name,
      entryPoint: resolve(source, settings.main || "src/index.html"),
      filesDirectories: [].concat(dirs.files || "files").map(d => resolve(source, d)),
      watchDirectories: [].concat(dirs.watch || ["files", "src"]).map(d => resolve(source, d)),
      defaultTarget,
    };
  },
  getBuildOptions(dir, { world, target, debug = false }) {
    const options = CLI.getSourceOptions(dir);
    options.targetDirectory = CLI.resolveTarget(options.name, { world, target }) || options.defaultTarget
    options.debug = debug;
    return options;
  },
  getCreateOptions(dir, options = {}) {
    let abs = resolve(".", dir);
    const name = basename(abs);
    let entry = stat(abs, { throwIfNoEntry: false });
    if (entry) {
      assert(entry.isDirectory(), `Path ${abs} exists but is not a directory.`);
      let entries = readdir(abs);
      assert(entries.length == 0, `Path ${abs} is not empty`);
    }
    return { createDirectory: abs, projectName: basename(abs) }
  },
  doBuild(options) {
    try {
      CLI.checkTarget(options.targetDirectory)
      Builder.build(options);
    } catch (error) {
      if (error.location) {
        console.log(String(error), "\n  at", error.file + ":" + error.location.start.line + ":" + error.location.start.column);
        if (options.debug) console.log(error)
      } else throw (error);
    }
  },
  commands: {
    create: {
      params: chalk`[{dim new_project_dir}]`,
      title: "Create a new minity project",
      describe:
`Creates a minity starter project.

All arguments are optional:
* Defaults to the current directory. The directory must be empty if it already exists.
`,
      exec([dir = "."], options) {
        let { createDirectory, projectName } = CLI.getCreateOptions(dir, options);
        const { simulate } = options;
        if (!simulate) {
          mkdir(createDirectory, { recursive: true });
          const files = walk(resolve(__dirname, "starter"));
          for (const file of files) {
            const input = readFile(file.path, { encoding: "utf8" });
            const output = input.replace(/###PACK###/g, projectName);
            const target = resolve(createDirectory, file.rel);
            mkdir(dirname(target), { recursive: true })
            writeFile(target, output, { encoding: "utf8" })
          }
          console.log('Created a fresh minity project in', createDirectory);
        } else {
          console.log('Would create a fresh minity project in', createDirectory);
        }
      },
    },
    example: {
      params: chalk`[{dim new_project_dir}]`,
      title: "Create a new minity project from an example",
      describe: 
`Creates a new minity project from one of the provided examples. You will be given a list of examples to choose from.

All arguments are optional:
* Defaults to the current directory. The directory must be empty if it already exists.
`,
      params: chalk`[{dim new_project_dir}]`,
      async exec([dir = "."], options) {
        let { createDirectory } = CLI.getCreateOptions(dir, options);
        let example = await CLI.chooseExample(createDirectory);
        if (!example) throw new Error("Nothing chosen.")
        console.log("copying example", basename(example), "to", createDirectory)
        mkdir(createDirectory, { recursive: true });
        const files = walk(example);
        for (const file of files) {
          const target = resolve(createDirectory, file.rel);
          mkdir(dirname(target), { recursive: true })
          copyFile(file.path, target)
        }
        console.log("Done.")
      },
    },
    options: {
      async exec([dir = "."], options) {
        console.log(JSON.stringify(CLI.getBuildOptions(dir, options), null, 2));
      }
    },
    link: {
      params: chalk`[{dim project_dir}] [--world={dim minecraft_save_name}|--target={dim target_path}]`,
      title: `Add a link to the project build directory`,
      describe:  
`Creates a link to the project's build directory, either in the datapacks directory of a Minecraft save directory,
or at any path. If the target path alredy exists, and is not a symbolic link, this will fail. No data will be
overwritten.

All arguments are optional:
* If you provide neither --world nor --target path, you will be given a list of Minecraft saves to choose from.
* Project directory defaults to the current directory. It must be a minity project directory or within a minity
  project directory.`,

      async exec([dir = "."], options) {
        const {
          explain,
          code,
          format,
          targetDirectory,
          defaultTarget
        } = await CLI.getLinkOptions(dir, options, "Linking datapack", "Choose the Minecraft world to link to");

        switch (code) {
          case 'IS':
            console.log("Already linked.");
            break;
          case 'CANNOT':
            throw new Error(explain)
          case 'OTHER':
            console.log(explain)
            const { confirm } = await prompt([{
              message: "Overwrite?",
              type: "confirm",
              name: "confirm"
            }])
            if (!confirm) throw new Error("Not confirmed.")
            unlink(targetDirectory);
          case 'CAN':
            symlink(defaultTarget, targetDirectory);
            console.log("Linked", targetDirectory, "->", defaultTarget);
            break;
          default:
            throw new Error()
        }
      },
    },
    unlink: {
      params: chalk`[{dim project_dir}] [--world={dim minecraft_save_name}|--target={dim target_directory}]`,
      title: `Remove a link to the project build directory`,
      describe:  
`Removes a link to the project's build directory, either from the datapacks directory of a Minecraft save directory,
or from any path. If the target path is not a symbolic link, this will fail. No data will be deleted.

All arguments are optional:
* If you provide neither --world nor --target path, you will be given a list of Minecraft saves to choose from.
* Project directory defaults to the current directory. It must be a minity project directory or within a minity
  project directory.`,
     async exec([dir = "."], options) {
        const {
          explain,
          code,
          format,
          targetDirectory,
          defaultTarget
        } = await CLI.getLinkOptions(dir, options, "Unlinking datapack", "Choose the Minecraft world to unlink from");

        switch (code) {
          case 'CANNOT':
            throw new Error(explain)
          case 'OTHER':
            console.log(explain)
            const { confirm } = await prompt([{
              message: "Unlink anyway?",
              type: "confirm",
              name: "confirm"
            }])
            if (!confirm) throw new Error("Not confirmed.")
          case 'IS':
            unlink(targetDirectory);
            console.log("Unlinked ", targetDirectory)
            break;
          case 'CAN':
            console.log("Already not linked.");
            break;
          default:
            throw new Error()
        }
      },
    },
    build: {
      params: chalk`[{dim project_dir}] [--world={dim minecraft_save_name}|--target={dim target_directory}]`,
      title: `Compile and build a minity project`,
      describe:  
`Builds a datapack from your minity project, either in the project build directory (the default), or in a 
specific location.

All arguments are optional:
* If you provide neither --world nor --target path, the datapack will be built in the project build directory.
* If you provide --world without a world name, you will be given a list of Minecraft saves to choose from.
* Project directory defaults to the current directory. It must be a minity project directory or within a minity
  project directory.`,
      async exec([dir = "."], options) {
        const buildOptions = CLI.getBuildOptions(dir, options);
        CLI.doBuild(buildOptions);
      },
    },
    watch: {
      params: chalk`[{dim project_dir}] [--world={dim minecraft_save_name}|--target={dim target_directory}]`,
      title: `Compile and build a minity project and watch for changes`,
      describe:  
`Builds a datapack from your minity project, and rebuilds on every source file change in the project. You still
have to type /reload in Minecraft to see the changes in linked worlds.

You can build either in the project build directory (the default), or in a specific location. 

All arguments are optional:
* If you provide neither --world nor --target path, the datapack will be built in the project build directory.
* If you provide --world without a world name, you will be given a list of Minecraft saves to choose from.
* Project directory defaults to the current directory. It must be a minity project directory or within a minity
  project directory.`,
      async exec([dir = "."], options) {
        const buildOptions = CLI.getBuildOptions(dir, options);
        for (const path of buildOptions.watchDirectories) {
          watch(path, {
            persistent: true,
            recursive: true
          }, build);
        }
        build();
        function build() {
          CLI.doBuild(buildOptions);
          console.log("Waiting for change ...")
        }
      },
    },
    help: {
      params: chalk`[{dim command}]`,
      title: "Help with minity commands",
      describe: "You asked for help about help.",
      exec([id], options) {
        const cmd = CLI.commands[id]; 
        if (!id) {
          console.log("Minity is a scripting language for Vanilla Minecraft JE.\n");
        } else if (!cmd) {
          console.log("No such command",id);
        }
        if (!id || !cmd) {
          CLI.commands.usage.exec();
          console.log(chalk`\nUse {bold help [${Object.keys(CLI.commands).filter(it=>!!CLI.commands[it].params).join("|")}]} for more help.`)
          return
        }

        const {title,params,describe} = CLI.commands[id];
        console.log(chalk`{bold minity ${id} - {yellow ${title}}}\n`);
        console.log("Usage:", chalk.bold("minity "+id+" "+params));
        console.log("\n"+describe);
      },
    },
    usage: {
      exec() {
        for (const id in CLI.commands) {
          const {params} = CLI.commands[id];
          if (params) console.log("minity "+id.padEnd(8),params)
        }
      }
    }
  }
}
CLI.doCmd()

