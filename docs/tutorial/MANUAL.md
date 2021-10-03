# MCL
Any files with the extension `.mcl` will be parsed by MCL. 
Appropriate `.mcl` and possibly `.json` files will be generated 
and saved in your build directory.


 
## Part 2: Variables

##### Try

* Put the following in `index.mcl` in your MCL project directory.
````powershell
namespace tutorial
var $a
$a = 1
$b = 2

print "first" $a $b
test()
print "now" $a $b

function test () {
  var $b
  $b = 3
  print "test" $a $b
  $a = 4
  print "test2" $a $b
}

````
* Build the project and run `/reload` in Minecraft. The following is displayed in chat:
  * `first 1 2`
  * `test 1 3`
  * `test2 4 3`
  * `now 4 1`
  
##### Note

* `var $<name>` declares a variable. Variables are stored in Minecraft's scoreboard, so they can only contain non-negative integers.
* Each function has its own variable scope. This means that:
  * Variables declared in a function will be separate from the ones in the parent scope.
  * Variables from the parent scope will still be available in the function.
* `print <args...>` is a simple helper for `/tellraw`. Its arguments can include strings and variables.
* Variables declared in functions are not really local variables in the usual programmer's sense. They are just scoped to the function and are shared between all calls to the function. 
  
