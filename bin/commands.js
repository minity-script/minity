const chalk = require("chalk");
const {actions, isPathEmpty, listExamples} = require("./Project");
const {menus} = require("./Interactive");
const {resolve} = require("path");
const commands = exports.commands = {
  create: {
    title: "Create a new Minity project",
    help: [{
      params: chalk`[{green TARGET_PATH}]`,
      describe:
      `Invokes an interactive UI for creating a Minity project.`
    },{
      params: chalk`[{green TARGET_PATH}] {bold --starter}`,
      describe: `Creates a starter Minity project.`
    },{
      params: chalk`[{green TARGET_PATH}] {bold --example=}{green EXAMPLE_NAME}`,
      describe: `Creates a new Minity project from an example.`
    },{
      params: chalk`[{green TARGET_PATH}] {bold --list}`,
      describe:
      `List available templates`
    }],
    async exec([dir="."], {example,list,starter}) {
      if (list) {
        const examples = listExamples();
        for (const {name,description} of examples) {
          console.log(name.padEnd(16),description)
        }
      } else if (starter) {
        actions.create({createPath:dir,starter:true})
      } else if (example) {
        if (!isPathEmpty(dir)) dir=resolve(dir,example);
        actions.create({createPath:dir,example})
      } else {
        const {action,...options} = await menus.create(dir);
        actions[action](options)
      }
    },
  },
  links: {
    title: `Add and remove your datapack from Miniecraft saves.`,
    help: [{
      params: chalk`[{green PROJECT_DIR}]`,
      describe:
      `Invokes the interactive menu.`,
    },{
      params: chalk`[{green PROJECT_DIR}] {bold --status}`,
      describe:
      `List link status.`,
    },{
      params: chalk`[{green PROJECT_DIR}] {bold --list}`,
      describe:
      `List existing links.`,
    },{
      params: chalk`[{green PROJECT_DIR}] \{{bold --add}|{bold --remove}\}{bold =}{green MINECRAFT_SAVE_NAME}... [{bold --force}]`,
      describe:
      `Add and/or remove links. Multiple --add and --remove options can be specified.
  Use --force to overwrite links that point to other paths.`,
    }],
    async exec([dir = "."],{list,add,remove,force}, ) {
      if (list) {
        actions.list_links({path:resolve(dir)});
      } else if(!add && !remove) {
        const {action,...options} = await menus.links(dir);
        actions[action](options)
      } else {
        add=[].concat(add).filter(Boolean);
        remove=[].concat(remove).filter(Boolean);
        overwrite = []
        console.log({path:resolve(dir),add,remove,overwrite,force})
        actions.links({path:resolve(dir),add,remove,overwrite,force})
      }
    },
  },
  build: {
    params: chalk`[{green PROJECT_DIR}] [{bold --target=}{green TARGET_PATH}]`,
    title: `Compile and build a Minity project`,
    describe:
      `Builds a datapack from your Minity project, either in the project build directory (the default), or in a 
specific location.`,
    async exec([dir = "."], {target}) {
      actions.build({path:dir,buildDirectory:target})
    },
  },
  watch: {
    params: chalk`[{green PROJECT_DIR}] [{bold --target=}{green TARGET_PATH}]`,
    title: `Watch a Minity project directory and rebuild on every change`,
    describe:
      `Watches files in your Minity project directory, and rebuilds your datapack on every change, either in the project build directory (the default), or in a 
specific location.`,
    async exec([dir = "."], {target}) {
      actions.watch({path:dir,buildDirectory:target})
    },
  },
  menu: {
    params: chalk`[{green PROJECT_DIR}]`,
    title: "Interactive UI for Minity",
    describe: "Everything you need in one place.",
    async exec([dir = "."],) {
      await menus.main(dir);
    },
  },
  help: {
    params: chalk`[{green COMMAND}]`,
    title: "Help with minity commands",
    describe: "You asked for help about help.",
    exec([id], options) {
      const cmd = commands[id];
      if (!id) {
        console.log("Minity is a scripting language for Vanilla Minecraft JE.\n");
      } else if (!cmd) {
        console.log("No such command", id);
      }
      if (!id || !cmd) {
        commands.usage.exec();
        console.log(chalk`\nUse {bold help [${Object.keys(commands).filter(it => !!commands[it].title).join("|")}]} for more help.`)
        return
      }
      console.log(chalk`{bold minity ${id} - {yellow ${cmd.title}}}\n`);
      let help = cmd.help || [cmd];
      for (const line of help) {
        const { params, describe } = line;
        console.log(chalk.bold("$ minity " + id + " " + params));
        console.log("  "+chalk.dim(describe)+"\n" );
      }
    },
  },
  usage: {
    exec() {
      console.log(chalk.bold("minity"))
      for (const id in commands) {
        const help = commands[id].help || [commands[id]];
        for (const line of help) {
          const { params, } = line;
          if (params) console.log(chalk.bold("minity " + id.padEnd(8)),params)
        }
      }
    }
  }
}