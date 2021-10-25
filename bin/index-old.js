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
const statSafe = (path, options) => statSync(path, { throwIfNoEntry: false, ...options })
const lstat = (path, options) => lstatSync(path, { throwIfNoEntry: false, ...options })

const { resolve, relative, basename, dirname } = require("path");
const assert = require("assert");
const { spawnSync: spawn, spawnSync, execSync } = require('child_process');
const watch = require('node-watch');
const { utils: { walk }, Builder } = require("@minity/parser");
const chalk = require("chalk");
const inquirer = require("inquirer");
const { Console } = require("console");
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
    if (!cmd) cmd = "menu"
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
    try {
      if (realpath(link) == target) return {
        code: "LINKED",
        box: "×",
        explain: "",
        format: chalk.green
      };
    } catch {
      return {
        code: "OTHER",
        box: "?",
        explain: "Link exists, but points to a nonexistent path",
        format: chalk.yellow
      }
    }

    return {
      code: "OTHER",
      box: "?",
      explain: "Link exists, but points to " + realpath(link),
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

  getLinkChoices({ name, defaultTarget }) {
    const path = resolve(CLI.minecraftPath, "saves");
    const entries = readdir(path, { withFileTypes: true });
    const worlds = []
    //entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const saveStat = statSafe(resolve(path, entry.name,"level.dat"));
        if (!saveStat) continue;
        const linkPath = resolve(path, entry.name, "datapacks", name);
        const status = CLI.checkLinkTarget(linkPath, defaultTarget);
        const { box, format, explain } = status
        worlds.push({
          name: format(entry.name) + (status.code === "OTHER" ? " ("+chalk.gray(explain)+")":""),
          checked: status.code == "LINKED",
          disabled: status.code == "CANNOT" ? chalk.grey(status.explain) : false,
          short: entry.name,
          code: status.code,
          mtime: saveStat.mtime,
          value: {
            code: status.code,
            //...status,
            name: entry.name,
            path: resolve(path, entry.name),
          }
        })
      }
    }
    worlds.sort((a,b)=>b.mtime-a.mtime);
    return worlds;
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
      if (statSafe(file)?.isFile()) {
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
      name,
      entryPoint: resolve(source, settings.main || "src/index.html"),
      filesDirectories: [].concat(dirs.files || "files").map(d => resolve(source, d)),
      watchDirectories: [].concat(dirs.watch || ["files", "src"]).map(d => resolve(source, d)),
      minecraftPath: settings.minecraftPath || CLI.minecraftPath,
      defaultTarget,
      settings
    };
  },
  getBuildOptions(dir, { world, target, debug = false }) {
    const options = CLI.getSourceOptions(dir);
    options.targetDirectory = CLI.resolveTarget(options.name, { world, target }) || options.defaultTarget
    options.debug = debug;
    return options;
  },
  checkCreateDirectory(dir) {
    let abs = resolve(".", dir);
    let entry = statSafe(abs, { throwIfNoEntry: false });
    if (!entry) return true;
    if (!entry.isDirectory()) return false;
    let entries = readdir(abs);
    return entries.length == 0
  },
  getCreateOptions(dir, options = {}) {
    let abs = resolve(".", dir);
    assert(CLI.checkCreateDirectory(abs), `Path ${abs} exists but is not empty.`);
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
          case 'LINKED':
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
          case 'LINKED':
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
    menu: {
      params: chalk`[{dim project_dir}]`,
      title: "Interactive UI for Minity",
      describe: "Everything you need in one place.",
      async exec([dir = "."],) {
        const source = CLI.resolveSource(dir);
        if (!source) {
          await MenuOutsideProject(dir);
        } else {

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
          console.log("No such command", id);
        }
        if (!id || !cmd) {
          CLI.commands.usage.exec();
          console.log(chalk`\nUse {bold help [${Object.keys(CLI.commands).filter(it => !!CLI.commands[it].params).join("|")}]} for more help.`)
          return
        }

        const { title, params, describe } = CLI.commands[id];
        console.log(chalk`{bold minity ${id} - {yellow ${title}}}\n`);
        console.log("Usage:", chalk.bold("minity " + id + " " + params));
        console.log("\n" + describe);
      },
    },
    usage: {
      exec() {
        for (const id in CLI.commands) {
          const { params } = CLI.commands[id];
          if (params) console.log("minity " + id.padEnd(8), params)
        }
      }
    }
  }
}


async function run() {
  const {Interactive} = require("./Interactive");
  await Interactive();
  return;
  let source = CLI.resolveSource(".");
  if (source) {
    await MenuInsideProject(resolve("."))
  } else {
    await MenuOutsideProject(resolve("."))
  }
  //await CLI.doCmd()
}

run();

async function MenuOutsideProject(dir) {
  //console.log("This directory is not within a Minity project");
  const choice = await MenuWithExit({
    message: "Choose an action:",
  }, {
    "Create a Minity project": "create",
  })
  switch (choice) {
    case 'create':
      let source = await MenuCreateProject(dir)
      console.log("create from", source)
  }
}


async function MenuCreateProject(dir) {
  const path = resolve(__dirname, "..", "examples");
  const entries = readdir(path, { withFileTypes: true });
  const examples = {}
  for (const entry of entries) {
    if (entry.isDirectory()) {
      examples[entry.name] = {
        value: {
          path: resolve(path, entry.name),
          name: entry.name
        },
        short: entry.name
      }
    }
  }

  let createDir = dir;
  const answers = await prompt([{
    message: "Choose the starter or an example project to create",
    type: "list",
    name: "template",
    default:"starter",
    choices: Choices(
      { "Create a starter project": "starter" },
      ...examples
    )
  }, {
    message: "Where do you want to create a Minity project?",
    type: "list",
    name: "useCurrentDirectory",
    when: () => CLI.checkCreateDirectory(dir),
    choices: Choices({
      "This directory": true,
      "A subdirectory": false,
    })
  }, {
    message: "Choose a directory name",
    name: "path",
    type: "input",
    default: ({ template, useCurrentDirectory }) => useCurrentDirectory ? "" : template.name,
    when: ({ useCurrentDirectory }) => !useCurrentDirectory,
    validate: value => CLI.checkCreateDirectory(resolve(dir, value)) || resolve(dir, value) + " is not empty"
  }, {
    message: "Choose an id for your datapack",
    name: "id",
    type: "input",
    default: ({ path }) => basename(resolve(dir, path || "")).toLowerCase().replace(/\W+/g, '_'),
    validate: value => !value.match(/[^a-z0-9_]/) || "Only lowercase letters, numbers and underscores allowed."
  }, {
    message: "Choose a name for your datapack",
    name: "name",
    type: "input",
    default: ({ id }) => id,
    validate: value => !!value
  }, {
    message: "You can provide further details about your datapack (desciption, details about authorship, etc.)",
    type: "list",
    name: "enterDetails",
    when: () => CLI.checkCreateDirectory(dir),
    default: true,
    choices: Choices({
      "I will do this now": true,
      "Skip, I will do it later": false,
    })
  }, {
    message: "Short description",
    name: "description",
    askAnswered: true,
    type: "input",
    //validate: value=>!!value,
    when: ({ enterDetails }) => !!enterDetails,
  }, {
    message: "Author's name",
    name: "author.name",
    type: "input",
    when: ({ enterDetails }) => !!enterDetails,
  }, {
    message: "Author's Minecraft login name",
    name: "author.login",
    type: "input",
    when: ({ enterDetails }) => !!enterDetails,
  }, {
    message: "Author's Email",
    name: "author.email",
    type: "input",
    validate: value => !value || !!value.match(/^\S+@([a-z0-9-_]+)(\.[a-z0-9-_]+)+[a-z]$/) || "not a valid email address",
    when: ({ enterDetails }) => !!enterDetails,
  }, {
    message: "Author's Website",
    name: "author.website",
    type: "input",
    validate: value => {
      if (!value) return true;
      try {
        let url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol)) return "Protocol must be http or https not " + url.protocol;
        return true;
      } catch {
        return "not a valid url";
      }
    },
    when: ({ enterDetails }) => !!enterDetails,
  }])
  console.log(answers);
}


async function MenuInsideProject(dir) {
  const project = CLI.getSourceOptions(dir);
  const linkChoices = CLI.getLinkChoices(project);
  const answers = await prompt([{
    message: "Choose an action",
    type: "list",
    name: "command",
    default: true,
    choices: Choices({
      "Link project to a Minecraft save directories": { value: "link", short: "Link" },
      "Build project": { value: "build", short: "Build" },
      "Build and watch project": { value: "watch", short: "Build and Watch" },
    }, {
      "Exit Minity": "exit"
    })
  }, {
    message: "Choose a Minecraft world to link to this project\n  ",
    type: "checkbox",
    name: "worlds",
    when: ({ command }) => command == "link",
    default: null,
    loop:false,
    pageSize:12,
    filter: worlds => {
      const add = [];
      const remove = [];
      const overwrite = [];

      for (const {value:{code,name}} of CLI.getLinkChoices(project)) {
        if(code=="LINKED" && !worlds.find(it=>it.name===name)) remove.push(name);
        else if (code=="CAN" && worlds.find(it=>it.name===name)) add.push(name);
        else if (code=="OTHER" && worlds.find(it=>it.name===name)) overwrite.push(name);
      }
      return {overwrite,add,remove,changes:overwrite.length+remove.length+add.length};
    },
    choices: () => linkChoices,
  }, {
    message: ({worlds})=>{
      const {add,remove,overwrite} = worlds;
      return `Adding ${add.length}, removing ${remove.length}, overwriting ${overwrite.length} links.\n  Do you want to continue?`
    },
    type: "confirm",
    name: "confirm",
    filter: value => !value,
    when: ({ command, worlds }) => command==="link" && worlds.changes > 0,
    default: ({worlds}) => worlds.overwrite.length == 0,
  },
])
  //console.log(answers);
}

async function MenuChoices(rest, ...args) {
  const final = Choices(...args);
  const { choice } = await prompt([{
    loop: false,
    ...rest,
    name: "choice",
    type: "list",
    choices: final
  }])
  return choice;
}

async function MenuWithExit(rest, ...args) {
  const choice = await MenuChoices(rest, ...args, {
    "Exit Minity": { value: "exit", short: "Aborted." }
  })
  if (choice === "exit") {
    console.log("Goodbye.");
    process.exit(0)
  }
  return choice;
}



function Choices(...args) {
  const final = [];
  for (const choices of args) {
    if (final.length >= 0) {
      final.push(new inquirer.Separator())
    }
    for (const id in choices) {
      if (typeof choices[id] === "object") {
        final.push({ name: id, ...choices[id] })
      } else {
        final.push({ name: id, value: choices[id] })
      }
    }
  }
  return final;
}
