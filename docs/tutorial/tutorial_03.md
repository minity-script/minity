
## Part 3: Arithmetic

##### Try

* Put the following in `index.mcl` in your MCL project directory.
````powershell
namespace tutorial

var $a = 4
var $b = 3
print "first" $a $b

$a ++
$b *= 5
print "second" $a $b

$a -= 3
$b %= $a
print "third" $a $b

$a >= 3
$b <=> $a
print "last" $a $b

````
* Build the project and run `/reload` in Minecraft. The following is displayed in chat:
  * `first 4 3` 
  * `second 5 15` : `$a` was increased by one and `$b` was multiplied by 3.
  * `third 2 1` : `$a` was decreased by 3 and `$b` was modulod with the new value of `$a`.
  * `last 1 3`: `$a` was forced to be at least 3, then the two values were swapped.
  
##### Note

* You can use arithmetic operations to change variable values. The operand can be a non-negative integer or a variable. The allowed operators are:
  *  `+=` addition
  *  `-=` subtraction
  *  `*=` multiplication
  *  `/=` division
  *  `%=` modulo
  *  `>=` at least
  *  `<=` at most
  *  `<=>` swap
