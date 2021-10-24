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

const {commands} = require("./commands");

const CLI = {
  async doCmd() {
    const argv = require('minimist')(process.argv.slice(2), {
      boolean: ['debug', "simulate", "force","list","status","help"],
      string: ['template', "world", "add", "remove"],
      alias: {
        template: "e",
        target: "t",
        world: "w",
        debug: "d",
        simulate: "s",
        force: "f",
        usage: "?"
      }
    })
    const {
      _: [cmd, ...args],
      target,
      world,
      simulate,
      debug,
      force,
      template,
      list,
      status,
      help,
      usage,
      add,
      remove
    } = argv;
    //console.log(argv)
    //    const version = require("../package.json").version;
    //    inform(chalk.bold.yellow("minity v" + version))
    let command = commands[cmd];
    if(usage) {
      await commands.usage.exec();
      return; 
    } 
    if(help) {
      if (!command) {
        await commands.help.exec([])
      } else {
        await commands.help.exec([cmd])
      }
      return;
    } 
    if(!command) {
      args.unshift(cmd);
      command=commands.menu;
    }
      try {
      await command.exec(args, { 
        target, 
        world, 
        simulate, 
        debug, 
        force,
        template,
        list,
        add,
        remove
      });
    } catch (error) {
      console.error(debug ? error : String(error));
      console.error("Exiting.")
      process.exit(-1)
    }
  },
}

CLI.doCmd()