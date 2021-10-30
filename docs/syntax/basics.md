## Starting a datapack :id=basics1

### Anatomy of a Minity project
Creating a basic Minity project with `minity create --starter <my_pack>` will produce the following file/directory structure
<pre style="line-height:1;padding:1em">

└─ &lt;my_pack>/
     
    ├─ minity.json
    │ 
    ├─ src/
    │    
    │   └── index.minity
    │ 
    ├─ files/
    │    
    │   └── data/
    │ 
    └─ build/
</pre>

* `minity.json` contains settings and information about your project. It it also used by Minity to identify the root directory of Minity projects. 
* `src/` is the place for your Minity script files. By default, `src/index.minity` is the entry point of your script. Any other Minity files you create should be imported directly or indirectly from the entry point.
* All files in the `files/` directory will be copied to your datapack when it is built. You don't need to create a `pack.mcmeta` file in this directory (it will be created automatically by Minity), but you can populate the data directory with loot tables, predicates, advancements, etc. as you would in a regular Minecraft datapack.
* `build/` is the default build target directory for your project. This is where your datapack will be built if you run `minity build` or `minity watch` without the `--target` option. This is also the directory that will be the target of symbolic links in your Minecraft saves created with `minity links`.
  
> The paths of the entry point, the files directory and the build directory can all be changed in `minity.json`. This might be useful e.g. on Windows, if you are not able to create symbolic links, or if for some reason you desire a different directory structure.

### Hello World
Minity code is written in files with the `.minity` file extension. Minity will parse your code and compile it into `.mcfunction` files in your datapack. Some minity statements will also produce or alter `.json` files in your datapack.

Each `.minity` file can contain minity statements, as well as comments and native minecraft commands for any functionality that is not included in minity. Any statements in the root of the file (i.e. outside any functions or macro definitions) will be executed when the datapack is (re)loaded. 

The following `index.minity` will display "Hello world" on (re)load and do nothing else:

````minity
namespace my_pack
say Hello world
````

> Note that every `.minity` file must begin with a namespace declaration. Read on for details.

## Namespaces and functions

### Defining the namespace
Most minity statements requires a namespace to be set. This will among other things determine the location of compiled `.mcfunction` files, prefixes for namespaced identifiers for your variables, scores, etc.

#### **namespace** <small>[declaration](defs#declaration)</small>
````minity
namespace tutorial          // applies from this point on

function hello() {          // this will become function tutorial:hello
  say Hello world!
}

function goodbye() {        // this will become function tutorial:goodbye
  say Goodbye!
}
````
### Defining functions
#### **function** <small>[declaration](defs#declaration)</small>
Each function is compiled to a `.mcfunction` file. Functions are declared with the `function` keyword.

````minity
function hello() {
  say Hello world!
}
````
This will create a function named "hello" in `hello.mcfunction` in your current namespace. Functions must go into namespaces, so they must appear after a namespace statement.

!> Minity is currently quite particular about the placement of braces. It allows newlines inside them, but not before them, nor after them if the statement continues after the braces. You should generally follow the use of whitespace as shown in this documentation. <br>This might be relaxed in the future, but it must first be thoroughly tested for ambiguity.

### Calling functions

````minity
//let's call our functions on load
hello() 
goodbye()

// or from the minecraft chat
/function tutorial:hello
/function tutorial:goodbye
````
To call a function from a different namespace, prefix it with the namespace and `:`
````minity
function hello() {  
  say Hello world!
}

namespace mypack

function greet() {
  tutorial:hello()
  say It's a splendid morning
}

greet()
````
Function calls compile directly to `function <name>` in .mcfunction, so you can use them to call functions in other namespaces and datapacks, whether they were written in minity or not.
````minity
some_other_namespace:do_stuff()
````

### Tagging functions
You can tag functions when you create them. Minity will automatically generate the correct JSON files for function tags.

````minity
function hello_overworld() #greet {
  say Hello overworld!
}
function hello_nether() #greet {
  say Hello nether!
}
#greet()                              // will call both greetings
````
The tag namespace defaults to the current namespace, but different namespaces can be provided.

````minity
function again_and_again #minecraft:tick {
  // will be called on every tick
}
````

## Other core concepts :id=basics2

### Grouping commands with braces
In many constructs, like `as/at`, `if ... else` or `repeat ... until`, you will want several commands to be executed in the same context or under the same conditions. Minity allows grouping commands with `{}` braces in all such constructs:
````minity
at @player.playing {
  ...
}

if $a>3 {
  ...
}
````
Minity will put the commands within the block in an "anonymous function" in the `zzz_minity` namespace, which will be called from the surrounding function. This ensures that all tests and selector searches are done only once, and that changes to the state of selected entities or test conditions don't affect the flow control of the program. 

!> The downside is that this can produce a substantial number of additional function files. This can be an issue in the auto-completion menu for `/function` in Minecraft, but these are the same functions that you would have to manually create and name to achieve the same behavior with `.mcfunction` files. Minity tries to moderate the impact by ensuring that the anonymous functions appear at the bottom of the list. 

### Using native Minecraft commands
Minity has a small, but growing, set of builtin replacements for native commands, which allow you to easily use minity goodies like advanced selector syntax, variables, etc. See [Minity commands](syntax/commands) for details.

In other sitations, you can use `/command ....` to pass any native command through to Minecraft.

````minity
/playsound minecraft:entity.lightning_bolt.thunder player @s
````

Even though Minity doesn't provide wrappers for all native commands, you can still use advanced Minity features, like compile-time constants or advanced selector syntax, in native commands:

````minity
/playsound {?sound} player {@player.playing[distance<5]}
````
See [argument interpolation](#argument-interpolation) for details.
### Comments
Use `//` to introduce comments. Anything between `//` and the end of the line is a comment and will be ignored by minity.
````minity
// this is a comment
if $a > 3 setblock air // this is a comment too
````
The exception are native commands prefixed with `/` and a few minity commands that encapsulate "greedy" native commands like `/say` and `/tellraw`, which will eat up everything until the end of the line:
````minity
/setblock ~ ~ ~ minecraft:stone //not a comment, will throw syntax error in minecraft

say Everything's fine //also not a comment, it will be printed out in minecraft chat
````


### Splitting code across multiple files
Keeping your whole program in one file can become impractical, so you may decide to split into multiple files. You can import other minity files with the `import` directive. 

#### **import** <small>[directive](defs#directive)</small>

````minity
import "./helpers.minity"
````
Relative paths must begin with a dot. The `.minity` file extension is implied, and importing a directory will import the `index.minity` file in the directory. The following three statements are equivalent:
````minity
import "./helpers/index.minity"
import "./helpers/index"
import "./helpers"
````
!> Some minity features (variables, macros, etc.) need to be declared or defined before they are used, the order of imports and where in your file you put them can be important. This requirement could be relaxed in the future.
