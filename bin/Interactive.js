const chalk = require('chalk');
const { prompt, Select, MultiSelect } = require('enquirer');
const { resolve, basename, relative } = require("path");
const { projectFromPath, listExamples, canCreateProjectAtPath, findProjectPath, outsideProject, preventCreateProjectAtPath, validateCreatePath } = require("./Project");
exports.menus = {
  create: MenuCreateProject,
  links: MenuManageLinks,
  main: Interactive
}

async function Interactive(path = ".") {
  const { commands } = require("./commands");
  const { actions } = require("./Project");
  process.chdir(path);
  try {
    do {
      const { action, ...args } = await MenuMain(".");
      switch (action) {
        case 'exit':
        case 'create':
        case 'links':
        case 'build':
        case 'watch':
          await actions[action](args);
          break;
        case 'usage':
          await commands.help.exec([]);
          process.exit(0)
          break;
        default:
          //console.log(action, args)
      }
    } while (true);
  } catch (error) {
    if (error) throw error;
    console.log("Goodbye.");
    process.exit(0);
  }
}

async function MenuMain(path = ".") {
  if (findProjectPath(path)) {
    return await MenuInsideProject(path)
  } else {
    return await MenuOutsideProject(path)
  }
}

const mainMenuChoices = [{
  role:"separator"
},{
  name: "usage",
  hint: "Help for Minity CLI commands",
},{
  name: "exit",
  hint: "Exit Minity",
},]


async function MenuOutsideProject(path) {
  outsideProject(path, true)
  console.log(chalk`\n{yellow {bold >} Not within a Minity project (${resolve(path)})}`)
  const answers = {};
  answers.action = await menu({
    message: "Choose an action:",
    choices: [{
      name: "create",
      hint: "Create a Minity project",
    }, ...mainMenuChoices
    ]
  })
  try {
    switch (answers.action) {
      case 'create':
        Object.assign(answers, await MenuCreateProject(path));
        break;
    }
    return answers;
  } catch (error) {
    console.log(error);
    return { action: "abort" };
  }
}

async function ask(props) {
  const { value } = await prompt({
    ...props,
    name: "value"
  })
  return value;
}

async function menu(props) {
  let max = 0;
  for (const {name,message,role} of props.choices) {
    if (role==='separator') continue;
    max = Math.max(max,(message||name).length)
  }
  props.choices = props.choices.map(ch => ({...ch, message: (ch.message||ch.name)?.padEnd(max+3)}))
  return await ask({
    ...props,
    type:"select"
  })
}


async function MenuCreateProject(path) {
  outsideProject(path, true)

  let template, createPath, info = {
    name: null,
    description: "",
    author: {
      name: null,
      login: null,
      email: null,
      website: null
    },
  }
  do {
    const examples = listExamples()

    template = await menu({
      message: "Project Template",
      hint: "Choose a template for your project",
      initial: template || "starter",
      choices: [
        {name:"starter",hint:"A starter Minity Ooject"},
        {name:"example",disabled:true,message:"─────",hint:"... or one of the examples"},
        ...examples.map(({ name, description }) => ({ name, hint: description }))
      ]
    })
    const canCreateHere = canCreateProjectAtPath(path);
    createPath = await ask({
      type: "input",
      message: "Project Path",
      hint: canCreateHere ? "leave empty to use the current directory" : "",
      initial: createPath ? relative(path, createPath) : canCreateHere ? "" : template,
      result: path => {
        return resolve(path || ".")
      },
      validate: value => validateCreatePath(value),
      footer() {
        const { input, initial } = this.state;
        const target = resolve(path, input || initial);
        const prevent = preventCreateProjectAtPath(target);
        if (prevent === false) {
          return chalk`{grey ${target}}: {green OK}`
        } else {
          return chalk`{grey ${target}}: {red ${prevent}}`
        }
      }
    })

    info.name = await ask({
      type: "input",
      message: "Datapack name",
      initial: info.name || basename(createPath),
      validate: (name) => {
        return !!name.match(/^[a-z0-9_]+$/) || "can only contain lowercase letters, numbers and underscore"
      }
    })

    info.description = await ask({
      type: "input",
      message: "Description",
      initial: info.description || "",
    })

    info.author.name = await ask({
      type: "input",
      hint: "optional",
      message: "Your Name",
      initial: info.author.name || "",
    })
    info.author.login = await ask({
      type: "input",
      hint: "optional",
      message: "Your Minecraft Login",
      initial: info.author.login || "",
    })
    info.author.email = await ask({
      type: "input",
      hint: "optional",
      message: "Your Email",
      initial: info.author.email || "",
    })
    info.author.website = await ask({
      type: "input",
      hint: "optional",
      message: "Your Website",
      initial: info.author.website || "",
    })
    const confirm = await menu({
      type: "select",
      message: "Is this OK?",
      choices: [{
        name: "ok",
        hint: "Go ahead and create the project"
      }, {
        name: "redo",
        hint: "Edit the project information"
      }, {
        name: "cancel",
        hint: "Do not create a project",
      }]
    })
    if (confirm == "ok") break;
    if (confirm == "cancel") throw new Error("aborted");
  } while (true)
  return {
    action: "create",
    starter: template=="starter",
    example: template!='starter' && template,
    createPath, 
    info: {
      name: info.name,
      description: info.description,
      author: {
        name: info.author_name,
        login: info.author_login,
        email: info.author_email
      }
    }
  }
}

async function MenuInsideProject(path) {
  const project = projectFromPath(path, true);
  project.status();
  const answers = {};
  answers.action = await menu({
    message: "Choose an action:",
    choices: [{
      name: "links",
      hint: "Install your datapack in your Minecraft saves [" + project.countLinks() + " linked]",
    }, {
      name: "build",
      hint: "Build your project",
    }, {
      name: "watch",
      hint: "Build project and rebuild on every change",
    }, ...mainMenuChoices
    ]
  })
  answers.path = project.path;
  try {
    switch (answers.action) {
      case 'links':
        Object.assign(answers, await MenuManageLinks(project.path));
        break;
    }
    return answers;
  } catch (error) {
    console.log(error);
    return { action: "abort" };
  }
}


async function MenuManageLinks(path) {
  const project = projectFromPath(path, true);
  do {
    const links = project.listLinks()
    const widget = new MultiSelect({
      name: "links",
      type: "multiselect",
      message: "Links in Minecraft saves",
      initial: links.filter(it => it.linked).map(it => it.name),
      limit: 16,
      hint: "saves/.../datapack/"+project.name+" -->" + project.buildDirectory,
      footer() {
        const selected = this.state.choices.filter(choice => choice.enabled).map(choice => choice.name)
        const { add, remove, overwrite, changes } = diff(selected)
        const msg = ` ADD ${add.length} REMOVE ${remove.length} OVERWRITE ${overwrite.length}`
        return chalk.inverse.bold(msg.padEnd(process.stdout.columns));
      },
  
      choices: links
        .map((data) => {
          const { name, linked, disabled, explain, indicator, mtime, overwrite } = data;
          return ({
            name,
            message: name.padEnd(24),
            enabled: linked,
            disabled: disabled,
            mtime,
            linked,
            hint: (_, choice) => {
              if (disabled) return explain;
              if (choice.enabled && overwrite) return chalk.bold.yellow("OVERWRITE LINK");
              if (choice.enabled && linked) return "Linked";
              if (choice.enabled && !linked) return chalk.bold.green("ADD LINK");
              if (!choice.enabled && linked) return chalk.bold.red("REMOVE LINK");
              if (overwrite) return explain
            },
            indicator: (_, choice) => {
              if (choice.enabled && overwrite) return chalk.bold.yellow(" [✔]");
              if (choice.enabled === true) return chalk.bold.green(" [✔]");
              if (linked) return chalk.bold.red(" [×]")
              if (overwrite) return chalk.bold.yellow(" [-]");
              if (choice.disabled) return chalk.bold.grey(" [-]");
              return chalk.reset.bold(" [ ]");
            },
          })
        })
    });

    function diff(selected) {
      const add = [], remove = [], overwrite = [];
      let changes = 0;
      for (const link of links) {
        changes++
        if (link.linked && !selected.includes(link.name)) remove.push(link.name);
        else if (link.overwrite && selected.includes(link.name)) overwrite.push(link.name);
        else if (!link.linked && selected.includes(link.name)) add.push(link.name);
        else changes--
      }
      return {add, remove, overwrite, changes }
    }


    const selected = await widget.run();
    const { add, remove, overwrite, changes } = diff(selected);
    if (changes == 0) {
      console.log("No change. Returning to project menu.")
      return { action: "abort", path };
    }
    console.log("The following", changes, "changes will be made:");
    for (const it of add) console.log(chalk` * {green add       ${it}}`);
    for (const it of remove) console.log(chalk` * {red remove    ${it}}`);
    for (const it of overwrite) console.log(chalk` * {yellow overwrite ${it}}`);


    const confirm = await ask({
      type: "select",
      message: "Is this OK?",
      choices: [{
        name: "ok",
        message: "ok       ",
        hint: "Go ahead and make these changes"
      }, {
        name: "redo",
        message: "redo     ",
        hint: "Display the list again"
      }, {
        name: "cancel",
        message: "cancel   ", 
        hint: "Do not make any changes",
      }]
    })
    if (confirm == "ok") return { action:"links",path, add, remove, overwrite };
    if (confirm == "cancel") throw new Error("aborted");
  } while (1)
}
