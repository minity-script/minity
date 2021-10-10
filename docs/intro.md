
## mclang syntax
Mclang code is written in files with `.mclang` efile xtension. You can use IDE extensions for syntax highlighting and error reporting.

Use `//` to introduce comments. Anything between `//` and the end of the line is a comment and will be ignored by mclang.

Each .mclang file can contain mclang statements, as well as native minecraft commands for any functionality that is not included in mclang. Use `/command ....` to pass native commands through to minecraft.

Any statements in the root of the file (i.e. outside any functions) will be executed when the datapack is (re)loaded. The following index.mclang will display "Hello world" on load and do nothing else:
````
/say Hello world
````

## 1. Functions and namespaces
### 1.1. Defining functions
Each function is compiled to a .mcfunction file.

````
function hello() {
  /say Hello world!
}
````
This will create a function name "hello" in hello.mcfunction in your current namespace. The default namespace is `mclang_dev`, but you will want to change that if you plan to use your datapack with others.

### 1.2. Setting the namespace
````
namespace tutorial
// applies from this point on

function hello() {
  /say Hello world!
}

//let's call it on load
hello() 

````
### 1.3. Tagging functions
You can tag functions when you create them. The tag namespace defaults to the current namespace, but different namespaces can be provided. Mclang will automatically generate the correct JSON files for function tags.

````
function hello_overworld() #greet {
  /say Hello overworld!
}
function hello_nether() #greet {
  /say Hello nether!
}

#greet()
  // will call both greetings

function again_and_again #microsoft:tick {
  // will be called on every tick
}
````
## 2. Execution context
### 2.1. Shorter syntax
There is no `execute` and `run` in mclang. You simply write the execution modifiers (`as`, `at`, `positioned`, etc.) and commands without them. 
````
as @a /say hello
// each player says hello

as @a at @s summon_enemies()
// calls the function as and at each player
````
### 2.2. Grouping commands
If you need to do several things in the same execution context (i.e. current entity, position, rotation, etc.), put them in `{}` brackets. 

You don't have to use `()` brackets around the arguments to execution modifiers, but you can if it helps you make sense of your code.
````
as (@a)  { 
  /kill @s
  /say I'm dead
  at (@s) build_grave()
}
// each player dies, then says I'm dead
// then we call our function to build
// a grave where the player died
````
Statements within braces will be put in an *anonymous function* which will be saved under a unique name in the mcl namespace. This guarantees that all statements in the block (including subfunctions) will be called with the same execution context, even if anything changes in between. Compare the two different cases below:

````
function kill_all {
  as @e /kill @s
    // each entity dies
  as @e /say I'm dead
    // no entity says anything, because @e selects 
    // only live entities
}

function better_kill_all {
  as @e {
    /kill @s
    /say I'm dead.
    // each entity dies, then says I'm dead
  }
}
````
## 3. Execution modifiers
You can use all builtin execution modifiers: `as`, `at`, ... Some additional modifiers are provided by maclang. See also if/unless/else statements below for an upgraded version of if/unless.

### 3.1. <tt>**for** *selector*</tt>
Shorthand for to set the execution entity and position at the same time. 

````
for @e[distance=...3] { ... }

// is the same as  ...

as @e[distance=...3] at @s { ... }
````
### 3.2. <tt>pos</tt> and <tt>rot</tt>

These are shorthands for `positioned` and `rotated`. They also work for `pos as` and `rot as`.

### 3.3. <tt>(**north**|**south**|**east**|**west**|**up**|**down**) *float*</tt>
Syntactic sugar for changing the execution position in world coordinates.
```
at @p up 2 do_something()

// ... is the same as ...

at @p positioned ~ ~2 ~ do_something()
```
Consecutive shorthand position modifiers will be combined:
```
at @p up 2 west 3 down 4 do_something()
// ... is the same as ...
at @p positioned ~ ~-2 ~3 do_something()
```

### 3.5. <tt>(**forward**|**back**|**left**|**right**|**upward**|**downward**) *float*</tt>
Syntactic sugar for changing the execution position in the current entity's coordinate system.
```
at @p left 2 forward 3 do_something()

// ... is the same as ...

at @p positioned ^-2 ^ ^3 do_something()
```

### 3.6. <tt>(**left**|**right**|**up**|**down**) *float*<b>deg</b></tt>
Syntactic sugar for changing the execution rotation.
```
at @p left 90deg up 30deg do_something()

// ... is the same as ...

at @p rotated ~-20 ~30 do_something()
```
Whitespace is not allowed between the number and `deg`.

## Variables
### Scope variables
To declare a variable, use the `var` keyword. Variable names are prefixed with `$`
````
var $my_var = 0
var $my_other_var
````
The variable will be namespaced to the namespace and function where it is declared, and shared between all the calls to the function. Variables that are not redeclared are inherited from parents scope.

````
var $foo = 0
var $bar = 0

function bar {
  var $foo
  $foo = 1
  $bar = 1
}
bar()
// $bar is now 1, $foo is still 0
````
If you don't assign a value to the declared variable, the existing value will be preserved across function calls and reloads.
### Entity scores
Entity scores are variables that can be stored on each entity. To declare a score, use the `score` keyword. They are scoped like variables.
````
score my_score

function foo() {
  score my_score 
  //separate from global my_score
}
````
Score values are accessed by connecting the entity selector and the score name with `->`

````
var $foo
score hits

@p->hits = 10
$foo     = @p->hits
````
By default scores use the `dummy` criterion, so they behave like regular integer variables. You can however specify a different criterion and take advantage of the full power of Minecraft's scoreboard system.
````
score my_trigger trigger
score died deathCount
````

### Assignment
Anything that is or returns an integer can be assigned to a variable or an entity score.
````
$foo = ...
@p->my_score = ...

... =  @p->my_score
... = $foo
... = @p::Inventory[{Slot:1b}].Count   // Entity data
... = (up 2)::Items[{Slot:1b}].Count   // Block data
... = &storage_name::nbt.path          // Storage data
````
You can also use any native command or mclang statement
````
$foo    = function_name() 
@s->bar = /command ...
$foo    = $bar = $baz 
````
You can swap the values of two variables and/or entity scores:
````
$foo >< $bar   // using minecraft's original syntax
$foo <=> $bar  // using mclang's more conventional alternative
````

### Arithmetics
You can do basic arithmetics on variables and entity scores. The accepted operands for all operations are integers, variables and entity scores.
````
$foo <op> ...
@p->my_score <op> ...

... <op> 12
... <op> $foo
... <op> @s->my_score
````
The accepted operations are:
````
$foo ++       // add 1
$foo --       // subtract 1
$foo += ...   // add 
$foo -= ...   // subtract
$foo *= ...   // multiply
$foo /= ...   // integer division
$foo %= ...   // modulo (remainder on division)
$foo >= ...   // set $foo to at most ...
$foo <= ...   // set $foo to at least ...

````
