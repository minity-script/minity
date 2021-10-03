## Part 1: Hello world

##### Try

* Put the following in `index.mcl` in your MCL project directory.
````powershell
namespace tutorial

function hello {
  /say Hello world!
}

/say Loaded.
hello()
````
* Build the project and run `/reload` in Minecraft.
  * `Loaded.` and `Hello world!` is displayed in chat. 
* Run `/function tutorial:hello` in game. 
  *  `Hello world!` is displayed in chat. 
##### Note
* `namespace <namespace>` sets the current namespace. This is where all your functions after this point will go.
* `function <name> { <code> }` defines a function. All the code within the braces will be included in the function.
* `/<command>` Executes a native minecraft command. This allows you to always use all minecraft commands, even those that don't have useful helper syntax in MCL.
* `<function_name>()` executes a function. The function name is a minecraft resource location, so it can include a namespace and slashes.
* All statements at the root of your file will be run when the datapack is loaded.
  