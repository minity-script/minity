const watch = require('node-watch');
const os=require("os")
const { utils: { walk }, Builder } = require("@minity/parser");
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
  realpathSync: realpath,
  readlinkSync: readlink,
  
} = require("fs");
const statSafe = (path, options) => {
  try {
    return statSync(path, { throwIfNoEntry: false, ...options })
  } catch {
    return null;
  }
}
const lstatSafe = (path, options) => {
  try {
    return lstatSync(path, { throwIfNoEntry: false, ...options })
  } catch {
    return null;
  }
}
const isDirectorySafe = (path) => statSafe(path)?.isDirectory()
const isLinkSafe = (path) => lstatSafe(path)?.isSymbolicLink()

const { resolve, relative, absolute, basename, dirname } = require("path");
const assert = require("assert");
const chalk = require("chalk");
const { prompt } = require('enquirer');

module.exports = {
  projectFromPath,
  findProjectPath,
  listExamples,
  canCreateProjectAtPath,
  isPathEmpty,
  insideProject,
  outsideProject,
  preventCreateProjectAtPath,
  validateCreatePath,
  actions: {
    abort:()=> {
      console.error("Aborted.")
    },
    create: (...args) => {
      const project = createProject(...args);
      process.chdir(project.path)
    },
    links: ({ path, add, remove, overwrite, force }) => {
      const project = projectFromPath(path);
      assert(project.isProject, "not a project path " + path);
      let added = 0, removed = 0, overwritten = 0, failed = 0
      for (const it of add) try {
        project.addWorldLink(it, force);
        added++
      } catch (error) {
        console.error("Cannot add "+it+": "+String(error.message))
        failed++
      }
      for (const it of remove) try {
        project.removeWorldLink(it, force);
        removed++
      } catch (error) {
        console.error("Cannot remove "+it+": "+String(error.message))
        failed++
      }
      for (const it of overwrite) try {
        project.overwriteWorldLink(it);
        overwritten++
      } catch (error) {
        console.error("Cannot overwrite "+it+": "+String(error.message))
        failed++
      }
      console.log(`  ${added} links added, ${removed} removed and ${overwritten} overwritten, ${failed} failed`)
    },
    links_status: ({path}) => {
      const project = projectFromPath(path,true);
      const links = project.listLinks();
      for (const {name,explain} of links) console.log(name.padEnd(24),explain);
    },
    links_list: ({path}) => {
      const project = projectFromPath(path,true);
      const links = project.listLinks();
      for (const {name,linked} of links) if (linked) console.log(name.padEnd(24));
    },
    exit: () => {
      console.log("Goodbye.")
      process.exit(0);
    },
    build: ({ path, buildDirectory }) => {
      const project = projectFromPath(path);
      assert(project.isProject, "not a project path " + path);
      project.tryBuild(buildDirectory);
    },
    watch: ({path}) => {
      return new Promise(async (resolve,reject)=>{
        const project = projectFromPath(path);
        assert(project.isProject, "not a project path " + path);
        const watchers = [];

        function start() {
          for (const dir of project.watchDirectories) {
            watchers.push(watch(dir, {
              persistent: true,
              recursive: true
            }, build));
          }
        }
        function stop() {
          for (const watcher of watchers) {
            watcher.close();
          }
        }
        function build() {
          project.tryBuild();
          console.error("  Waiting for change ...")
        }
        start();
        do {
          try {
            build();
            await prompt({
              type:"input",
              format:()=>"",
              name:"wait",
              message:"Press ^C to stop watching, or enter to rebuild at any time."
            })
          } catch(error) {
            stop();
            if(typeof error!=="string") {
              console.error(error);
              process.exit(1)
            }
            return resolve()
          }
        } while(1)
      })
    }
    
  },
}


/**
 * Find a Minity project in this or parent directories
 * 
 * @returns Project path or null if not found.
 * @param  {string} path
 */
function findProjectPath(path) {
  return find(resolve(".", path));
  function find(cur) {
    const file = resolve(cur, "minity.json");
    if (statSafe(file)?.isFile()) {
      return cur
    }
    const parent = resolve(cur, "..")
    if (parent === cur) return null;
    return find(parent);
  }
}
/**
 * Get a list of examples from the examples directory
 */
function getExample(name) {
  const path = resolve(__dirname, "..", "examples", name);
  return projectFromPath(path);
}
function exampleExists(name,error) {
  const example=getExample(name);
  return error ? assert(example.isProject,"No such example "+name) : !!example
}
function listExamples() {
  const path = resolve(__dirname, "..", "examples");
  const entries = readdir(path, { withFileTypes: true });
  const examples = [];
  for (const entry of entries) {
    const project = getExample(entry.name)
    if (!project.isProject) continue;
    examples.push(project)
  }
  return examples
}

function createProject({ createPath, starter, example, info }) {
  let template;
  if (starter) {
    template = projectFromPath(resolve(__dirname,"..","starter"));
  } else {
    exampleExists(example,true);
    canCreateProjectAtPath(createPath,true);
   template = getExample(example);
  }
  mkdir(createPath, { recursive: true });
  const files = walk(template.path);
  for (const file of files) {
    const target = resolve(createPath, file.rel);
    mkdir(dirname(target), { recursive: true })
    copyFile(file.path, target)
  }
  const settingsPath = resolve(createPath, "minity.json");
  const settings = Object.assign({}, require(settingsPath), info);
  writeFile(settingsPath, JSON.stringify(settings, null, 2), { encoding: "utf8" })
  const project = projectFromPath(createPath)
  console.log('Created project '+chalk.bold(project.name)+" at "+project.path)
  return project;
  
}

class ProjectPath {
  get defeaultMinecraftPath() {
    if (process.platform=="win32") return resolve(os.homedir(), "AppData", "Roaming", ".minecraft");
    if (process.platform == 'darwin') return resolve(process.env.HOME, "Library", "Application Support", "minecraft");
    if (process.platform == 'android') return resolve("/", "sdcard", "games", "com.mojang");
    return resolve(os.homedir(), '.minecraft');
  }
  constructor(path) {
    this.path = resolve(path);
  }
}

class Project extends ProjectPath {
  isProject = true;
  status() {
    console.log(chalk`\n{yellow {bold > ${this.name}} (a Minity project at ${this.path})}`)
  }
  constructor(path) {
    super(path);
    const settings = require(resolve(this.path, "minity.json"));
    const {
      name = basename(path),
      directories: {
        target: buildDirectory = "build",
        copy: copyDirectories = ["files"],
        watch: watchDirectories = ["files", "src"],
      },
      author = {},
      entryPoint = "src/index.minity",
      minecraftPath = this.defeaultMinecraftPath,
      description
    } = settings;
    Object.assign(this, {
      name,
      author,
      entryPoint: resolve(this.path,entryPoint),
      minecraftPath,
      buildDirectory: resolve(path, buildDirectory),
      copyDirectories: copyDirectories.map(it => resolve(path, it)),
      watchDirectories: watchDirectories.map(it => resolve(path, it)),
      description
    })
  }
  listLinks(buildDirectory = this.buildDirectory) {
    const { name } = this;
    const path = resolve(this.minecraftPath, "saves");
    let entries = readdir(path, { withFileTypes: true });
    const links = []
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const saveStat = statSafe(resolve(path, entry.name, "level.dat"));
        if (!saveStat) continue;
        const linkPath = resolve(path, entry.name, "datapacks", name);
        links.push({
          mtime: saveStat.mtime,
          path: linkPath,
          name: entry.name,
          ...checkLinkTarget(linkPath, buildDirectory)
        });
      }
    }

    links.sort((a, b) => b.mtime - a.mtime);
    //console.log(links)
    return links;
  }
  countLinks(buildDirectory = this.buildDirectory) {
    return this.listLinks().filter(it => it.linked).length;
  }
  countWorlds(buildDirectory = this.buildDirectory) {
    return this.listLinks().length;
  }
  getWorldLinkPath(world,reject) {
    const worldPath = resolve(this.minecraftPath, "saves", world);
    const saveStat = statSafe(resolve(worldPath, "level.dat"));
    if (!saveStat) return (reject ? assert(null,"No such minecraft save "+world) : null);
    return resolve(worldPath, "datapacks", this.name);
  }
  addWorldLink(world) {
    const linkPath = this.getWorldLinkPath(world,true);
    return this.addLink(linkPath);
  }
  removeWorldLink(world) {
    const linkPath = this.getWorldLinkPath(world,true);
    return this.removeLink(linkPath);
  }
  overwriteWorldLink(world) {
    const linkPath = this.getWorldLinkPath(world,true);
    this.overwriteLink(linkPath);
  }
  addLink(linkPath,force) {
    const {overwrite,linked,disabled,explain} = checkLinkTarget(linkPath,this.buildDirectory);
    assert(!linked, "Already linked.");
    assert(!disabled, explain);
    assert(!overwrite || force, explain);
    if (overwrite && force) unlink(linkPath);
    symlink(this.buildDirectory, linkPath)
  }
  removeLink(linkPath,force) {
    const {overwrite,linked,disabled,explain} = checkLinkTarget(linkPath,this.buildDirectory);
    assert(linked, "Mot linked.");
    assert(!disabled, explain);
    assert(!overwrite || force, explain);
    unlink(linkPath)
  }
  overwriteLink(linkPath) {
    this.addLink(linkPath,true);
  }
  checkBuildTarget(buildDirectory) {
    buildDirectory??=this.buildDirectory;
    if (!exists(buildDirectory)) return true;
    if (readdir(buildDirectory).length === 0) return true;
    if (exists(resolve(buildDirectory, ".minity.fecit"))) return true;
    throw new Error(buildDirectory + " exists, but was not built by minity");
  }
  build(buildDirectory) {
    buildDirectory??=this.buildDirectory;
    this.checkBuildTarget(buildDirectory);
    Builder.build(this);
  } catch(error) {
    if (error.location) {
      console.error(String(error), "\n  at", error.file + ":" + error.location.start.line + ":" + error.location.start.column);
      if (options.debug) console.log(error)
    } else throw (error);
  }
  tryBuild(buildDirectory) {
    buildDirectory??=this.buildDirectory;
    try {
      this.build(buildDirectory);
    } catch (error) {
      if (error.location) {
        const {message,file,location:{start:{line,column}}} = error;
        console.error(`\n${message} at ${file}:${line}:${column}`);
      } else console.error(error)
    }
  }
}

class NoProject extends ProjectPath {
  isProject = false;
  minecraftPath = this.defeaultMinecraftPath;
  get isEmpty() {
    return !exists(this.path) || readdir(this.path).length == 0;
  }

  status() {
    console.log(chalk`> {yellow There is no Minity project at this path.}`)
  }

}

class CorruptProject extends ProjectPath {
  isProject = false;
  isCorrupt = true;
  minecraftPath = this.defeaultMinecraftPath;
  constructor(path, error) {
    super(path);
    this.error = error;
  }
}
/**
 * Check if the path is inside a MinityProject
 *
 * @param  {string} path Path to check
 * @param  {boolean} reject Throw error on fail?
 */
function insideProject(path,reject) {
  path=resolve(path);
  const projectPath = findProjectPath(path);
  return reject ? assert (projectPath,"Path not inside a Minity project: "+path) : !!projectPath;
}

/**
 * Check if the path is outside a MinityProject
 *
 * @param  {string} path Path to check
 * @param  {boolean} reject Throw error on fail?
 */
 function outsideProject(path,reject) {
  path=resolve(path);
  const projectPath = findProjectPath(path);
  return reject ? assert (!projectPath,"Path is inside a Minity project: "+path) : !projectPath;
}


/**
 * Walk up the directory tree to find a Minity project root.
 * 
 * @param  {string} path Starting path
 * @param  {bool} reject Throw an error if not found?
 * @returns {Project} a Project object or null
 */
function projectFromPath(path,reject) {
  path = resolve(path);
  const projectPath = findProjectPath(path);
  if (projectPath) return new Project(projectPath);
  if (reject) assert(false,'Path not within a Minity project')
  return null;
}

function isPathEmpty(path) {
  path = resolve(path);
  return !exists(path) || isDirectorySafe(path) && readdir(path).length == 0;
}

/**
 * Checks if a Minity project can be created at the path.
 * 
 * Checks that the path does not exist or is an empty directory
 * and that it is not within a Minity project
 * @param  {string} path
 * @param  {boolean} reject
 */
function canCreateProjectAtPath(path,reject=false) {
  path = resolve(path);
  const prevent = preventCreateProjectAtPath(path)
  return reject ? assert(!prevent,prevent) : !prevent;
}

/**
 * Checks if there is anything stopping a Minity project
 * being created at the path.
 * 
 * @param  {string} path
  */
 function preventCreateProjectAtPath(path) {
  const projectPath = findProjectPath(path);
  if (projectPath) return "Path is inside a Minity project: "+path;
  if(!isPathEmpty(path)) return "Path is not empty: "+path
  return false;
}

/**
 * Validates a create path. Returns true on success, 
 * or an explanation for failure. 
 * @param  {string} path
 */
 function validateCreatePath(path) {
   const prevent = preventCreateProjectAtPath(path);
   return prevent === false ? true : prevent;
}


function checkLinkTarget(link, target) {
  const project = !!findProjectPath(link);
  if (project) return {
    add: false,
    overwrite: false,
    remove: false,
    linked: false,
    disabled: true,
    explain: "Is within minity project directory.",
  };

  const linkEntry = lstatSafe(link);
  if (!linkEntry) return {
    add: true,
    overwrite: false,
    remove: false,
    linked: false,
    explain: "Not linked.",
  };
  if (!linkEntry.isSymbolicLink()) return {
    add: false,
    overwrite: false,
    remove: false,
    linked: false,
    disabled: true,
    explain: "Path exists, but is not a link: " + link,
  };
  if (readlink(link) == target) return {
    add: false,
    overwrite: false,
    remove: true,
    linked: true,
    explain: "Linked."
  };
  else return {
    add: false,
    overwrite: true,
    remove: true,
    linked: false,
    explain: "Link exists, but points to " + readlink(link),
  }
}

