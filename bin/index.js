#!/usr/bin/env node

const { commands } = require("./commands");

(async function doCmd() {
  const argv = require('minimist')(process.argv.slice(2), {
    boolean: ['debug', "simulate", "force", "list", "status", "help", "starter", "version"],
    string: ['example', "add", "remove","target"],
    alias: {
      example: "e",
      target: "t",
      world: "w",
      debug: "d",
      starter: "s",
      force: "f",
      usage: "?",
      version: "v"
    }
  })
  const {
    _: [cmd, ...args],
    target,
    world,
    simulate,
    debug,
    force,
    example,
    list,
    starter,
    help,
    usage,
    add,
    remove,
    version,
  } = argv;
  if (version) {
    console.log("minity v" + require("../package.json").version)
    return;
  }
  let command = commands[cmd];
  if (usage) {
    await commands.usage.exec();
    return;
  }
  if (help) {
    if (!command) {
      await commands.help.exec([])
    } else {
      await commands.help.exec([cmd])
    }
    return;
  }
  if (!command) {
    args.unshift(cmd);
    command = commands.menu;
  }
  try {
    await command.exec(args, {
      target,
      world,
      simulate,
      debug,
      force,
      example,
      starter,
      list,
      add,
      remove
    });
  } catch (error) {
    console.error(debug ? error : String(error));
    console.error("Exiting.")
    process.exit(-1)
  }
})();
