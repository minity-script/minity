- [mclang syntax](#mclang-syntax)
- [Basic Syntax](#basic-syntax)
  - [Using native Minecraft commands](#using-native-minecraft-commands)
  - [Comments](#comments)
  - [Importing mclang files](#importing-mclang-files)
- [Namespaces and functions](#namespaces-and-functions)
  - [Setting the namespace](#setting-the-namespace)
  - [Defining functions](#defining-functions)
  - [Tagging functions](#tagging-functions)
- [Constants and macros](#constants-and-macros)
- [Control structures](#control-structures)
  - [A replacement for `execute ... run`](#a-replacement-for-execute--run)
  - [Grouping commands](#grouping-commands)
  - [Execution context modifiers](#execution-context-modifiers)
    - [<tt>**as** *selector* ...</tt>](#ttas-selector-tt)
    - [<tt>**at** *selector* ...</tt>](#ttat-selector-tt)
    - [<tt>**for** *selector* ...</tt>](#ttfor-selector-tt)
    - [<tt>**positioned** *position*</tt>](#ttpositioned-positiontt)
    - [<tt>**rotated** *rotation*</tt>](#ttrotated-rotationtt)
    - [<tt>**anchored** **(eyes|feet)**</tt>](#ttanchored-eyesfeettt)
    - [<tt>**align** *axes*</tt>](#ttalign-axestt)
    - [Relative direction modifiers: <tt>(**north**|**south**|**east**|**west**|**up**|**down**) *float*</tt>](#relative-direction-modifiers-ttnorthsoutheastwestupdown-floattt)
    - [Local direction modifiers: <tt>(**forward**|**back**|**left**|**right**|**upward**|**downward**) *float*</tt>](#local-direction-modifiers-ttforwardbackleftrightupwarddownward-floattt)
    - [Rotation modifiers: <tt>(**left**|**right**|**up**|**down**) *float*<b>deg</b></tt>](#rotation-modifiers-ttleftrightupdown-floatbdegbtt)
  - [<tt>(**if|unless)** *condition* /  ... [**else** ...]</tt>](#ttifunless-condition----else-tt)
    - [Else](#else)
    - [Combining conditionals](#combining-conditionals)
    - [Compare integers](#compare-integers)
      - [Test a single block](#test-a-single-block)
    - [Test for existence of entities](#test-for-existence-of-entities)
    - [Test for existence of NBT data](#test-for-existence-of-nbt-data)
    - [Test predicate](#test-predicate)
  - [<tt>**repeat** ... (**while**|**until**) *condition* ... [**then** ...] </tt>](#ttrepeat--whileuntil-condition--then--tt)
  - [<tt>**every** *interval* ... [(**until**|**while**) *condition*]</tt>](#ttevery-interval--untilwhile-conditiontt)
  - [<tt>**after** *interval* ...</tt>](#ttafter-interval-tt)
- [Variables and entity scores](#variables-and-entity-scores)
  - [Integer variables](#integer-variables)
  - [Entity scores](#entity-scores)
  - [Assignment](#assignment)
  - [Arithmetics](#arithmetics)
- [Entity tags](#entity-tags)
- [Bossbars](#bossbars)
  - [Adding a bossbar](#adding-a-bossbar)
- [Working with NBT Data](#working-with-nbt-data)
  - [Assignment](#assignment-1)
  - [<tt>(**prepend**|**append**) *NBT_path* *data*</tt>](#ttprependappend-nbt_path-datatt)
  - [<tt>(**insert**) *index* *NBT_path* *data*</tt>](#ttinsert-index-nbt_path-datatt)
  - [<tt>(**merge**) *NBT_path* *data*</tt>](#ttmerge-nbt_path-datatt)
  - [<tt>(**remove**) *NBT_path* *value*</tt>](#ttremove-nbt_path-valuett)
- [Advanced target selectors](#advanced-target-selectors)
  - [Selector conditions](#selector-conditions)
    - [<tt><b>@p</b> <b>@r</b> <b>@a</b> <b>@e</b></tt>](#ttbpb-brb-bab-bebtt)
    - [<tt><b>@[</b>*player_id*<b>]</b></tt>](#ttbbplayer_idbbtt)
    - [<tt><b>@</b>*type*</tt>](#ttbbtypett)
    - [<tt><b>@#</b>*entity_type_tag*</tt>](#ttbbentity_type_tagtt)
    - [<tt><b>[</b>*condition* *op* *value*<b>]</b></tt>](#ttbbcondition-op-valuebbtt)
    - [<tt><b>.</b>*tag*</tt>](#ttbbtagtt)
    - [<tt><b>!</b>*tag*</tt>](#ttbbtagtt-1)
    - [<tt><b>{</b>*NBT_data*<b>}</b></tt>](#ttbbnbt_databbtt)
    - [<tt><b>[-></b>*score_name* *op* *integer*<b>]</b></tt>](#ttb-bscore_name-op-integerbbtt)
  - [Sorting and limit](#sorting-and-limit)
- [Coordinates](#coordinates)
- [Values and types](#values-and-types)
  - [Numbers](#numbers)
    - [Integer](#integer)
    - [Float](#float)
    - [Typed Numbers](#typed-numbers)
  - [String](#string)
    - [String expansion](#string-expansion)
  - [List](#list)
  - [Typed Array](#typed-array)
  - [Compound](#compound)
  - [JSON String](#json-string)
  - [SNBT String](#snbt-string)
  - [Raw Text Markup](#raw-text-markup)
    - [<tt>&lt;span> &lt;div> &lt;p></tt>](#ttspan-div-ptt)
    - [Attributes](#attributes)
    - [<tt>&lt;b> &lt;i> &lt;u> &lt;s></tt>](#ttb-i-u-stt)
    - [<tt>&lt;h></tt>](#tthtt)
- [Argument interpolation](#argument-interpolation)
- [Operators](#operators)
  - [Assignment](#assignment-2)
  - [Arithmetics](#arithmetics-1)
  - [Comparison](#comparison)
  - [Other punctuation](#other-punctuation)
- [Keywords](#keywords)
  - [Selector keywords](#selector-keywords)
  - [Execution context keywords](#execution-context-keywords)
  - [Mclang keywords](#mclang-keywords)
  - [Commands](#commands)
- [Mclang Commands](#mclang-commands)
  - [<tt>append *NBTpath* *value*</tt>](#ttappend-nbtpath-valuett)
  - [<tt>bossbar add *id* *name*</tt>](#ttbossbar-add-id-namett)
  - [<tt>bossbar remove *id* </tt>](#ttbossbar-remove-id-tt)
  - [<tt>merge *NBTpath* *value*</tt>](#ttmerge-nbtpath-valuett)

</div>

<div style="overflow:auto;padding-left:30px">

## mclang syntax

Mclang code is written in files with the `.mclang` file extension. Mclang will parse your code and compile it into `.mcfunction` files in your datapack. Some mclang statements will also produce or alter `.json` files in your datapack.

You can use IDE extensions for syntax highlighting and error reporting.

## Basic Syntax

Most mclang syntax is concerned with naming of variables, accesing and assigning of data, arithmetics, and control structures. It is a complete replacement for .mcfunction commands `execute ... run`, `scoreboard` and `data`. 

Each .mclang file can contain mclang statements, as well as comments and native minecraft commands for any functionality that is not included in mclang.

Any statements in the root of the file (i.e. outside any functions) will be executed when the datapack is (re)loaded. The following `index.mclang` will display "Hello world" on (re)load and do nothing else:

````
/say Hello world
````

### Using native Minecraft commands
 Use `/command ....` to pass native commands through to minecraft.

````
/say Hello world
````

Mclang has a small, but growing, set of builtin replacements for native commands, which allow you to easily use mclang goodies like advanced selector syntax, variables, etc. See below for details.

In other situations, when you have to use native minecraft commands, mclang can offer some help with replacement patterns in curly brackets:

````
/execute as {@armor_stand.is_marker} run say I'm a {?color} marker
=> execute as @e[type=armor_stand,tag=--my_ns-is_marker] run say I'm a red marker
````
See below for details.

### Comments
Use `//` to introduce comments. Anything between `//` and the end of the line is a comment and will be ignored by mclang.
````
// this is a comment
if ($a>3) setblock air // this is a comment too
````
The exception are native commands prefixed with `/` and a few mclang commands that encapsulate "greedy" native commands like `say` and `tellraw`, which will eat up everything until the end of the line:
````
/setblock ~ ~ ~ minecraft:stone //not a comment, will throw syntax error in minecraft

say Everything's fine //also not a comment, it will be printed out in minecraft chat
````


### Importing mclang files
Keeping your whole program in one file can become impractical, so you may decide to split into multiple files.
````
import "./helpers.mclang"
import "./minigame.mclang"
````
Some mclang features (variables, macros, etc.) need to be declared or defined before they are used, the order of imports and where in your file you put them can be important.
<blockquote>
This requirement could be relaxed in the future.
</blockquote>

## Namespaces and functions
````
namespace tutorial

function hello() {
  /say Hello world!
}
hello() 
````
### Setting the namespace
Most mclang statements requires a namespace to be set. This will among other things determine where `.mcfunction` files are located, and namespaced identifiers for your variables, scores, etc.
````
namespace tutorial          // applies from this point on

function hello() {          // this will become function tutorial:hello
  /say Hello world!
}

function goodbye() {        // this will become function tutorial:goodbye
  /say Goodbye!
}
````
### Defining functions
Each function is compiled to a `.mcfunction` file.

````
function hello() {
  /say Hello world!
}
````
This will create a function named "hello" in `hello.mcfunction` in your current namespace. Functions must go into namespaces, so they must appear after a namespace statement.
<blockquote>
Mclang is currently quite particular about the placement of braces. It allows newlines inside them, but not before them, nor after them if the statement continues after the braces. You should generally follow the use of whitespace as shown in this documentation.

This might be relaxed in the future, but it must first be thoroughly tested for ambiguity.
</blockquote>

````
//let's call our functions on load
hello() 
goodbye()

// or from the minecraft chat
/function tutorial:hello
/function tutorial:goodbye
````
To call a function from a different namespace, prefix it with the namespace and `:`
````
namespace tutorial
function hello() {  
  /say Hello world!
}

namespace mypack

function greet() {
  tutorial:hello()
  /say It's a splendid morning
}

greet()
````
Function calls compile directly to `function <name>` in .mcfunction, so you can use them to call functions in other namespaces and datapacks, whether they were written in mclang or not.
````
namespace tutorial
some_other_namespace:do_stuff()
````


### Tagging functions
You can tag functions when you create them. Mclang will automatically generate the correct JSON files for function tags.

````
function hello_overworld() #greet {
  /say Hello overworld!
}
function hello_nether() #greet {
  /say Hello nether!
}
#greet()                              // will call both greetings
````
The tag namespace defaults to the current namespace, but different namespaces can be provided.

````

function again_and_again #minecraft:tick {
  // will be called on every tick
}
````

## Constants and macros
You can define compile time constants, which you can then use anywhere in your code where a value is expected.
````
?my_constant       = 12
?my_other_constant = "foo"

$a = ?my_constant
````
You can also define macro frunctions and pass arguments to them. The passed values will be usable inside the macro.

````
macro give_items(?id, ?count=10, ?damage=0b) {
  give @s ?count ?id{Damage:?damage}
}

as @a give_items( torch , 5 )           // give each player 5 torches

function give_eggs {
  at @chicken as @p give_items( egg )   // for each chicken, give an egg to 
                                        // the nearest player
} 
function give_cracked_eggs {
  at @chicken as @p {
    give_items( egg, ?damage=99b )      // for each chicken, give a damaged egg to 
  }                                     // the nearest player
} 
````
Each macro call is expanded to an anonymous function at compile time.

You can call macros from within macros:
````
macro give_items(?id, ?count=10) {
  give @s ?count ?id
}

macro give_eggs (?count=1) {
  at @chicken as @p give_items( egg )   // for each chicken, give an egg to 
                                        // the nearest player
} 

give_eggs(10)
````
You cannot direcly call macros recursively, since they are expanded at compile time. But the function returned by the macro can call itself recursively with `self()`:

````
macro raycast_destroy(?block) {
  unless(block) {
    forward 0.1 self()
  } else {
    setblock air
  }
}
raycast_destroy(stone)
````
Note that this will run forever, i.e. until Minecraft cuts off execution at 65,535 commands, if no stone is found, so it's not a good enough solution for raycasting by itself.

## Control structures
### A replacement for `execute ... run`
There is no `execute` and `run` in mclang. You simply write the execution modifiers (`as`, `at`, `positioned`, etc.) and commands without them. 
````
as @a /say hello
// each player says hello

as @a at @s summon_enemies()
// calls the function as and at each player
````
### Grouping commands
If you need to do several things in the same execution context (i.e. current entity, position, rotation, etc.), put them in `{}` braces. 

You don't have to use `()` brackets around the arguments to execution modifiers, but you can if it helps you make sense of your code.
````
as (@a)  { 
  /kill @s
  /say R.I.P.
  at (@s) build_grave()
}
// each player dies, then says R.I.P.
// then we call our function to build
// a grave where the player died
````
Statements within braces will be put in an *anonymous function* which will be saved under a unique name in the `zzz_mclang` namespace. This guarantees that all statements in the block (including subfunctions) will be called with the same execution context, even if anything changes in between. Compare the two different cases below:

````
function protect_base {
  at @e.base_marker {
    for @player[team!=my_team][distance < 10] {
      back 10 teleport
      tell @s You cannot come here
    }
    if @player[team=my_team][distance < 5]
  }  
}
````
You can use all builtin subcommands of `execute`: `as`, `at`, ... Some additional subcommands are provided by maclang. See also if/unless/else statements below for an upgraded version of if/unless.
### Execution context modifiers
#### <tt>**as** *selector* ...</tt>
Selects the matching items, and runs the following statement(s) for each of them, setting the current entity (`@s`) to each matching entity in turn. 
````
as @e[distance=...3] { 
  tag @s is_near
}
````
#### <tt>**at** *selector* ...</tt>
Selects the matching items, and runs the following statement(s) at each of their positions and rotations in turn, without changing the current entity. 
````
as @e[distance=...3] { 
  tag @s is_near
}
````

#### <tt>**for** *selector* ...</tt>
Shorthand for to set the execution entity and position at the same time. 
````
for @e[distance=...3] { ... }

// is the same as  ...

as @e[distance=...3] at @s { ... }
````
#### <tt>**positioned** *position*</tt>
Changes the current execution position, thus changing the meaning of relative coordinates in the following statement(s):
````
positioned 0 0 0 { 
  // ~ ~ ~ is now at world origin
}
positioned ~ ~3 ~ { 
  // ~ ~ ~ is now three blocks above
}
````
You will probably use this only for absolute coordinates, because mclang provides a more convenient way to change position with direction modifiers.

#### <tt>**rotated** *rotation*</tt>
Changes the current execution position, thus changing the meaning of local coordinates in the following statement(s):
````
rotated 0 0 { 
  // looking straight north
}
rotated ~ ~30 { 
  // rotate 30 degrees upwards
}
````
You will probably use this only for absolute rotation, because mclang provides a more convenient way to change rotation with direction modifiers.

#### <tt>**anchored** **(eyes|feet)**</tt>
Changes the current execution position and rotation to match that of the current item's eyes or feet.

#### <tt>**align** *axes*</tt>
Rounds down the current coordinates in the chosen axes. Note that you must specify the axes in the correct order, unlike in `.mcfunction`
````
align xyz ...   // align in all three axes
align xz ...    // align in horizontal axes
align xzy ...   // error, you must sort the axes corretly
````

#### Relative direction modifiers: <tt>(**north**|**south**|**east**|**west**|**up**|**down**) *float*</tt>
Syntactic sugar for changing the execution position in relative world coordinates.
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
#### Local direction modifiers: <tt>(**forward**|**back**|**left**|**right**|**upward**|**downward**) *float*</tt>
Syntactic sugar for changing the execution position in the current entity's coordinate system.
```
at @p left 2 forward 3 do_something()

// ... is the same as ...

at @p positioned ^-2 ^ ^3 do_something()
```

#### Rotation modifiers: <tt>(**left**|**right**|**up**|**down**) *float*<b>deg</b></tt>
Syntactic sugar for changing the execution rotation.
```
at @p left 90deg up 30deg do_something()

// ... is the same as ...

at @p rotated ~-20 ~30 do_something()
```
Whitespace is not allowed between the number and `deg`.

### <tt>(**if|unless)** *condition* /  ... [**else** ...]</tt>
```
if $a > 3 {
  say Larger than 3
} 
unless $a > 3 {
  say Not larger than 3
}
```
#### Else 
Mclang provides a true else, by pushing results of tests to a stack in data storage and running the else statement(s) only if the test originally failed. The following example will work completely as expected.
```
$a = 4
if $a > 3 {
  say Larger than 3
  $a = 0
} else if $a < 3 {          
  say Smaller than 3      
  $a++
} else {
  say Exactly 3!
}
```
#### Combining conditionals
```
$a = 4

if $a > 3 and unless $a > 5 {
  say Just right!
} else {          
  say Outside range
} 
```
Minecraft doesn't provide logical operators (AND, OR, etc.), but it does allow chaining of if/unless. The `and` keyword is needed to ensure that `else` blocks apply to the correct conditions:
```
// these two are the same, but different from above

if $a > 3 unless $a > 5 {
  say Just right!
} else {
  say Outside range
}

if $a > 3 {
  unless $a > 5 {
    say Just right!
  } else {
    say Outside range
  }
}

```


#### Compare integers
You can compare variables, scores and integer values.

The allowed operators are `== != < <= > >=`
```` 
if $a > 3 ...
if ( $a < @s->my_score ) ...  // you can use brackets if you prefer
if @s -> my_score == 3 ...
if ($a == 1..4) ....          // works with ranges
````
##### Test a single block
To test for a block, you need to provide a block predicate, possibly preceded by a coordinate or directions. The block predicate can be as little as the id of the block. The block id can be namespaced, and the namespace defaults to `minecraft:`.
```` 
if air ...                    // is the block at the current position air
if #wood ...                  // you can use JSON block tags
if ~ ~2 ~ air ...             // you can use coordinates
if up 2 air ...               // or directions
if torch[facing=north]        // block states 
if chest{Items:[...]}         // block NBT values
````
Be careful when testing for NBT values, putting a space before the braces will cause incorrect parsing.

#### Test for existence of entities
Simply provide a selector.
```` 
for @player {
  if @chicken.evil[distance<20] {
    say There are evil chickens nearby!
  }
}
```` 
#### Test for existence of NBT data
Provide a data path. Not that this only tests for existence of data, not truthiness.
````
if @s::Inventory[{id:stone}]        // does this entity have any stone
if @@my_storage::foo                // test storage data
if (up 2)::Items[{id:stone}]        // test block nbt data

if @s::Invulnerable                 // true if the path has any value, even if it's 0 or false 
```` 
#### Test predicate
````
if predicate my_predicate             // test my_predicate
if predicate other_ns:my_predicate    // you can use predicates from other namespaces
````
### <tt>**repeat** ... (**while**|**until**) *condition* ... [**then** ...] </tt>
Repeat the statements until the test is true or false.

````
var $count = 1
repeat {
  // this will repeat 10 times
  $count ++
} while ($count<=10)
````
If the statements within the loop are preceeded with subcommands, they will be applied on each loop:
````
repeat forward 0.1 {
  // will move forward on each step as long as the current block is air
} while air
````
You can combine several break conditions:
````
$count = 0;
repeat forward 0.1 {
  // will move forward on each step until stone is found stopping after at most 100 tries
  $count++
} until stone and while $count < 100 
````
If you provide a `then` statement, it will be run in the context of the last loop:

````
$count = 0;
repeat forward 0.1 {
  $count++
} until stone and while $count < 100 then {
  if(stone) say Stone found!
}
````

### <tt>**every** *interval* ... [(**until**|**while**) *condition*]</tt>
Run your statements at a regular interval.

````
every 300s {
  say Another 5 minutes have passed.
}

every 5t {
  // expensive operations that we want to run regularly, but not on every tick
}
````
You can provide break conditions that will stop the repetition:
````
var $running = false

function start() {
  say The minigame is beginning.
  $running = true
  every 1t {
    minigame_on_tick()
  } while ($running == true)
}

function stop() {
  $running = false
  say The minigame is ended.
}
````
Repetitions are scheduled with Minecraft's `schedule` command. This means that they don't inherit the execution context, so the following will not work as expected:
````
as nearest @chicken.evil {    // run following commands as the nearest chicken
  say I am evil
  every 1s {
    say "I am still evil"           
    // the current entity here is the Server, not the chicken
  }
}
````
If you provide a `then` statement, it will be run when the repetition ends:
````
every 1t {
  minigame_on_tick()
} while ($running == true) then {
  say Game Over
}
````
### <tt>**after** *interval* ...</tt>
Run your statements once after an interval has passed.
````
after 3600s {
  say You've been playing for an hour
}
````

## Variables and entity scores
Variables and entity scores can be used to store integers and do arithmetics on them. 

Varuables and entity scores need to be declared. The declared identifiers will not be used directly, they will be namespaced and scoped, so you don't need to worry about naming clashes with other namespaces or functions.

### Integer variables
To declare a variable, use the `var` keyword. Variable names are prefixed with `$`
````
var $my_var = 0
var $my_other_var
````
The variable will be namespaced to the namespace and function where it is declared, and shared between all the calls to the function. Variables that are not redeclared are inherited from parent scope.

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
To select entities by score, use the `@e[->score_name <op> value]` selector condition. See selector syntax below.
### Assignment
Anything that is or returns an integer can be assigned to a variable or an entity score.
````
$foo = ...
@p->my_score = ...

... =  @p->my_score
... = $foo
... = @p::Inventory[{Slot:1b}].Count   // Entity data
... = (up 2)::Items[{Slot:1b}].Count   // Block data
... = @@storage_name::nbt.path         // Storage data
... = bossbar my_bossbar max           // Bossbar properties (max, value, visible)
````
You can also use any native command or mclang statement:
````
$foo    = function_name() 
@s->bar = /command ...
````
You can store results of conditionals:
````
$foo    = test if ($a > $b) and unless ($b < 3)
@s->bar = /command ...
````
Or the success of conditionals or statements:
````
$foo    ?= test if ($a > $b) and unless ($b < 3)
@s->bar ?= /command ...
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
## Entity tags
Tags are used for grouping entities in useful ways. You need to declare tags before using them. 

````
tag my_tag
````
Use `tag` and `untag` to add and remove tags from entities:
````
tag @chicken evil
untag @s processed
````
Tags are namespaced and scoped to the local function.
````
function process_chickens() {
  tag processed
  for @chicken!processed {
    process_entity()
    tag @s processed
  }
}

function process_entities() {
  tag processed               // different tag from above. chickens processed 
  for @e!processed {          // by process_chicken() will still match here
    process_entity()
    tag @s processed
  }
}
````
To select entities by tags, use the `.tag_name` and `!tag_name` selector conditions. See selector syntax below.

## Bossbars
### Adding a bossbar
````
?max_time = 300

var $seconds_left = ?max_time

bossbar add timer "Time left"
bossbar timer max = ?max_time
bossbar timer value = ?max_time
bossbar timer players = @a
bossbar timer visible = true

every 1s {
  $seconds_left --
  bossbar timer value = $seconds_left
} while ($seconds_left > 0)  then {
  say Time has run out.
}

````

## Working with NBT Data
You can access NBT data with the `::` operator, followed by a NBT path.
````
@s::NoAI                        // entity data
(0 0 0)::Items[{Slot:1}]       // block data
@@ns:storage_name::nbt.path     // storage data, ns is optional and defaults 
                                // to the current namespace
@@nbt.path                      // shorthand for @@current_ns:mclang_vars storage
````
### Assignment
You can assign anything to a data path, subject to limitations imposed by Minecraft itself.
````
@s::Pos[0]                          = ...
(up 2 north 3)::Items[{Slot:1}]     = ...
@@storage_name::my.stored.value     = ...
@@my.stored.value                   = ...
````
In addition to all integer sources accepted by variable assignment, NBT paths accept strings, typed numbers, and structured NBT data, as well as NBT paths.
````
... = "My Entity"
... = 12d
... = { numbers: [ "zero", "one", "two", "three" ] }
... = @s::Inventory[{Slot:1b}].Count
````
You can assign NBT paths to variables and entity scores. The value assigned will depend on the content of the NBT path, as returned by native `data get` command.
````
$value_of_number       = @s::MyNumber
$length_of_string      = @s::MyString
$length_of_list        = @s::MyList
$number_of_child_tags  = @s::MyCompound

... = 12d
... = { numbers: [ "zero", "one", "two", "three" ] }
... = @s::Inventory[{Slot:1b}].Count
````
When assigning values between NBT paths and variables or entity scores, you sometimes need to specify the data type or scale the value. This is most commonly used in entity and block data, where Minecraft accepts only a certain type of number, e.g. byte or double.
````
@s::Invulnerable = 1b * @s->is_divine
@s::Pos[1]       = 1d * @s->stored_altitude
$scaled_size     = 8 * @@stored_size
````

### <tt>(**prepend**|**append**) *NBT_path* *data*</tt>
Prepend and append data to NBT lists. 
````
@s::MyList = ["A String"]
append @s::MyList "Last String"
prepend @s::MyList "First String"
    // the list is now ["First String","A String","Last String"]
````
Accepts value sources accepted by NBT Path assignment.

### <tt>(**insert**) *index* *NBT_path* *data*</tt>
Insert data into lists.
````
@s::MyList = ["First String"]
append @s::MyList "Last String"
insert 1 @s::MyList "A String"
    // the list is now ["First String","A String","Last String"]
````
### <tt>(**merge**) *NBT_path* *data*</tt>
Merge the supplied value or the content of source path to the target path.
````
merge @s::MyList ["Another String"]
merge @p::AchievedQuestSteps @s::GrantQuestSteps
````
### <tt>(**remove**) *NBT_path* *value*</tt>
Remove data at the target path.
````
@s::MyList = ["A String"]
append @s::MyList "Last String"
prepend @s::MyList "First String"
    // the list is now ["First String","A String","Last String"]
````

## Advanced target selectors
All valid minecraft selectors should work in mclang. The only exception are bare player ids, which are instead accepted in the form of `@[player_id]`

In addition, syntactic sugar is provided for some selector conditions. Similar to css, multiple conditions can be applied in series, as long as there is no whitespace betwen them. See below for the conditions that you can apply this way.
### Selector conditions
````
@item.special[distance <= 3]{Invulnerable:1b}

   // ... is the same as 

@e[type=item,tag=special,distance=..3,nbt={Invulnerable:1b}]
````
#### <tt><b>@p</b> <b>@r</b> <b>@a</b> <b>@e</b></tt>
These work exactly the same as in .mcfunction, and will match:
* `@p` the nearest player
* `@r` random player
* `@a` all players, alive or not
* `@e` all entities
* `@s` the entity executing the statement, i.e. each entity that was selected with `as` or `for`

#### <tt><b>@[</b>*player_id*<b>]</b></tt>
A replacement for bare player names or UUIDs used as target selectors in .mcfunction.

````
as @[yockz] {...}      => execute as yockz run ...

@armor_stand  // match all armor stands
              => @e[type=armor_stand]
````

#### <tt><b>@</b>*type*</tt>
Sets the `type` condition of the selector. The type can include a namespace, if not, it defaults to `minecraft`.

````
@item         // match all item entities   
              => @e[type=item]

@armor_stand  // match all armor stands
              => @e[type=armor_stand]
````

This will set the *target selector variable* to `@e`, and will match all live entities of the given type. This means that `@player` will match only live players, and you need to use `@a` if you want to target dead players as well. 

#### <tt><b>@#</b>*entity_type_tag*</tt>
Sets the `type` condition of the selector. If namespace is not provided, it defaults to `minecraft`.
````
@#raider            // match all raiders                       
                    => @e[type=#minecraft:raider]
@#my_pack:enemies   // match all enemies tagged in a datapack
                    => @e[type=#my_pack:enemies]
````
This will set the *target selector variable* to `@e`. See above.

#### <tt><b>[</b>*condition* *op* *value*<b>]</b></tt>
Match entities for which the test in the brackets is true. The condition is one of the native target selector conditions. The accepted values and allowed comparison operators depend on the condition.

* Allowed for all conditions:
````
@e[team = my_team]   // test if condition matches value
@e[team == my_team]  // alias of =, for consistency with mclang syntax
                     => @e[team = my_team]
````
* Allowed for some conditions, see Minecraft documentation:
````
@e[team =! my_team]  // negates the condition, only allowed for some conditions
@e[team != my_team]  // alias of =!, for consistency with mclang syntax
                     => @e[team =! my_team]
````
* Allowed for conditions that accept ranges:
````
@e[level >= 10 ]     => @e[level=10..]
@e[level >  10 ]     => @e[level=11..]
@e[level <= 10 ]     => @e[level=..10]
@e[level <  10 ]     => @e[level=..9 ]
````

#### <tt><b>.</b>*tag*</tt>
Sets the `tag` condition. Can be used multiple times. Uses namespaced tags declared in the current scope.
````
@a.newby                // match players with the `newby` tag in the current scope
                        => @e[tag=--my_ns-newby]
@item.special.key       // match items that have both tags
                        => @e[tag=--my_ns-special,tag=--mcl-my_ns-key]
if @s.special { ... }   // run statements if the current entity is special
                        => execute if @s[tag=--mcl-my_ns-special] run ...
````
#### <tt><b>!</b>*tag*</tt>
Sets the `tag` condition to exclude the tag. Uses namespaced tags declared in the current scope.
````
@e!special            // match items that are not tagged `special`
                      => @e[tag=!--my_ns-special]

@e.special!processed  // match items that are special but not yet processed
                      => @e[tag=--my_ns-special,tag=!--my_ns-my_func_processed]
````

#### <tt><b>{</b>*NBT_data*<b>}</b></tt>
Sets the `nbt` condition to the provided data. Can be used multiple times.

````
@e{Invulnerable:1b}    // match all invulnerable items
                       => @e[nbt={Invulnerable:1b}]
````

#### <tt><b>[-></b>*score_name* *op* *integer*<b>]</b></tt>
Match an entity score by setting the the `scores` condition. Uses namespaced score names declared in the current scope. The value must be a literal integer.

````
                     // match all players with scores matching
@a[->foo == 10]      => @a[scores={--my_ns-foo=10}]
@a[->foo == 1..10]   => @a[scores={--my_ns-foo=1..10}]
@a[->foo >= 10]      => @a[scores={--my_ns-foo=10..}]
@a[->foo > 10]       => @a[scores={--my_ns-foo=11..}]
@a[->foo <= 10]      => @a[scores={--my_ns-foo=..10}]
@a[->foo < 10]       => @a[scores={--my_ns-foo=..9}]
````
Can be repeated to match several scores:
````
@a[->foo == 10][->bar < 100]  => @a[scores={--my_ns-foo=10,--my_ns-bar=..99}]
````

### Sorting and limit
In addition to using the native `sort` and `limit` parameters, you can prefix the selector with the sort order and optional limit.
````
at nearest @item { ... }      // run commands at the nearest item
                              => execute at @e[type=item,sort=nearest,limit=1] run ...

at furthest 10 @item { ... }  // run commands at the the furthest ten item entitites, 
                              // sorted by distance
                              => execute at @e[type=item,sort=furthest,limit=10] run ...

at random all @item { ... }   // run commands at all items, randomly
                              // execute at @e[type=item,sort=random] run ...
at any 10 @item { ... }       // synonym for random

at arbitrary 10 @item { ... } // run commands at the first three created items
                              // execute at @e[type=item,sort=arbitrary,limit=3] run ...
at oldest @item { ... }       // synonym for arbitrary                         
````

## Coordinates
You will sometims need to specify coordinates for your commands. 

Mclang will accept standard minecraft coordinates (e.g. `~3 ~ ~2` or `^ ^ ^0.1`), but You can also use named directions in `()` brackets wherever a coordinate is expected, as long as all the directions are in the same coordinate system:
````
  setblock ^ ^ ^1 stone
  setblock (forward 1) stone
  setblock (forward 1 north 2) stone   // won't work, mixing different coordinate systems
````
Most mclang commands that accept coordinates will default to the current position, so these two will have the same effect, though they will compile slightly differently:
````
  setblock (forward 1) stone
    ==> setblock ^ ^ ^1 stone
  
  forward 1 setblock stone
    ==> execute positioned ^ ^ ^1 run setblock ~ ~ ~ stone
````
The same works for rotations, though you are even less likely to need to specify a rotation:
````
  setblock (forward 1) stone
    ==> setblock ^ ^ ^1 stone
  
  forward 1 setblock stone
    ==> execute positioned ^ ^ ^1 run setblock ~ ~ ~ stone
````
## Values and types
Mclang supports all the values supported by NBT tags. Like in .mcfunction, they are written in JSON-like syntax, with some relaxations, e.g. keys in compounds don't have to be quoted

### Numbers

#### Integer

Any integer value. Can include the sign.
````
100
+1
-100
````

#### Float

Any float value. Can include the sign and/or an exponent. In contexts where float values are implied, an integer value will be accepted as well.
````
3.14
+6.02E23
-273.4
42
````

#### Typed Numbers

In some contexts, notable when dealing with NBT data, typed numbers are required. The type of the number is specified by a suffix letter for each type.
````
1b        // byte
1s        // short
1i        // integer
1         // defaults to integer
1l        // long

3.14f     // float
3f        // still float
3.0       // defaults to float
1.2d      // double
````

### String
````
"my name"                 // an ordinary string
"\n \" \u2312 "           // accepts standard escape sequences
````

#### String expansion

Some bracketed sequences have a special meaning within doublequoted strings. These are all expanded by mclang during compilation. They can be used anywhere where strings are accepted in the code.

````
"The color is {?color}"     // expand constants and macro arguments

                            // the following can be useful for using variables, tags and scores
                            // declared in mclang with native minecraft commands

"{.processed}"              // expand a tag declared in mclang to the namespaced version
                            => "--my_ns-processed"
"{->my_score}"              // expand a score name declared in mclang to the namespaced objective
                            => "--my_ns-my_score"                           
"{$my_var}"                 // expand variable name declared in mclang to the target and objective
                            => "--my_ns-my_var --my_ns--vars"

"{.is_{?color}_key}"        // brackets can be nested
                            => "--my_ns-is_red_key"

"This is not a \{.tag}"     // escape brackets with backslash to avoid expansion
````

### List
List is the NBT equivalent of a JSON array. Its items are listed inside square brackets separated by commas. Can contain items of any NBT type.
````
[1, 2, 3]
[foo,bar,baz]

// can span across multiple lines
[
  { name: "john", born: 1940 },
  { name: "paul", born: 1942 },
  { name: "george", born: 1943 },
  { name: "ringo", born: 1940 }
]

````
### Typed Array
TODO
### Compound
Compound is the equivalent of a JSON object. It contains key-value pairs, listed within curly braces. Keys must be strings, values can be of any NBT type.

````
{ a:1, b:2, c:3 }

// can span across multiple lines
[
  "First String",
  "Second String",
  "Last String"
]

{a:1,b:2,c:"not a number"}    // will work, all values are accepted
{[1]:"bad key"}               // the key must be a string or convertable to string
````


### JSON String
Some Minecraft commands and properties accept JSON strings as values. To convert any value to a json string, prefix it with `json`
````
json 1           => "1"
json true        => "true"
json "name"      => '"name"'
json {
  a:b,
  c:[1,2,3]
}               => '{"a":"b","c":[1,2,3]}'
````
### SNBT String
Some Minecraft commands and properties accept SNBT strings as values. These are similar to JSON, but can also encode number types. 

<blockquote>
TODO: Because NBT lists don't accept different types of items inside the same list, this should fail on compilation for non-compliant data.
</blockquote>

````
snbt 1b                     => "1b"
snbt true                   => "1b"
snbt "name"                 => '"name"'
snbt [a,b,c]                => '["a","b","c"]'
snbt [1,2,"not_a_number"]   // not allowed
````

### Raw Text Markup
Raw Text is a powerful feature of Minecraft, but also notoriously hard to write. The ability for array and objects to span across multiple lines can help to an extent. But mclang can make it even easier for you, by using raw text markup, which is similar to HTML.

````
< div>
  <p color=red bold=true>
    My <i>Very</i> Red Book
  </p>
  <p>
    The book is red, 
    but <span color=green>
      this text is green.
    </span>
    Click <u 
      color = blue
      text = "here"
      clickEvent = {
        action: command
        value: "/say something"
    }
    /> to say something.
  </p>
< /div>
````

<blockquote>
<tt><b style="color:red">My <i>very</i>  Red Book</b></tt><br/><br/>
<tt>This book is red,</tt><br/>
<tt>but <span style="color:green">this text is green.</tt><br/>
<tt>Click <u style="color:blue">here</u> to say something.</tt><br/>
</blockquote>

#### <tt>&lt;span> &lt;div> &lt;p></tt>
These are the three general tags that will create a raw text object. The difference between them is how they handle whitespace.
* `<div>` will remove all whitespace directly on its inside, and ensure that there is exactly one newline before and after it, except at beginning or end of raw text.
* `<p>` will remove all whitespace directly on its inside, and ensure that there is exactly one newline before it and two after it, except at beginning or end of raw text.
* `<span>` will remove all whitespace directly on its inside.
* `<t>` is a shorthand for `<span>`.
* `<d>` is a shorthand for `<div>`.

In all three cases, the spaces and newlines within the tag, but not directly adjacent to it will be preserved, but each line will be trimmed, i.e. all spaces at begnning and end of line removed. Text within the `text` attribute will be included as is.

<blockquote>
This is likely buggy. Please report any unexpected behavior as an issue.
</blockquote>

#### Attributes
Attributes within tags directly set the properties of the raw text object. They accept any JSON value. Refer to raw text documentation for properties and values you can use.
````
<span 
  text="click me" underline=true 
  clickEvent = {
    action: command,
    command: "/say you clicked me"
  }
/>
````

#### <tt>&lt;b> &lt;i> &lt;u> &lt;s></tt>
These tags behave like `span` tags, but with basic formatting applied.

#### <tt>&lt;h></tt>
Heading. Like a `p` tag, but with bold already set to true.

````
@s::CustomName = <span color="red">
  The <b>most</b> dangerous item.
</span>
````

## Argument interpolation

| `token` | in strings and commands| in raw text markup|
|-|-|-|
|<nobr>`{?color}`</nobr>| value of the constant<br>e.g. `red` | same |
|<nobr>`{.processed}`</nobr>|internal name of the tag<br>e.g.`--my_ns-processed"`| same |
|<nobr>`{->my_score}`</nobr>|internal name of the score objective<br>e.g.`--my_ns-my_score"`| same |
|<nobr>`{@item}`</nobr>|compiled selector<br>e.g.`@e[type=item]"`| same |
|<nobr>`{(upward 1 forward 3)}`</nobr>|compiled coordinates<br>e.g.`^ ^1 ^3`| same |
|<nobr>`{$my_var}`</nobr>|internal target and objective of the variable<br>e.g.`--my_ns-my_var --my_ns--vars`|value of the variable|
|<nobr>`{@s->my_score}`</nobr>|compiled selector and objective<br>e.g.`@s --my_ns-my_score`|value of the score

## Operators
### Assignment
| `operator` | description |
|-|-|
|`=`| assign value |
|`?=`| assign success |
|`<=>`| swap values |

### Arithmetics
| `operator` | description |
|-|-|
|`--`| plus 1 |
|`--`| minus 1 |
|`+=`| addition |
|`-=`| subtraction |
|`*=`| multiplication |
|`/=`| division |
|`%=`| modulo |
|`>=`| choose larger |
|`>=`| choose smaller |

### Comparison
| `operator` | description |
|-|-|
|`==`| equals |
|`-=`| does not equal |
|`<`|  less than |
|`<=`| less or equal |
|`>`| greater than |
|`>=`| greater or equal |

### Other punctuation
Other non-alphanumeric characters that can appear in the code. Some can mean different things in different contexts.
| `operator` | description |
|-|-|
|`?`|  constant/macro arg prefix |
|`$`|  variable prefix |
|`@`|  selector prefix |
|`@@`| storage pregix |
|`::`| introduce NBT path |
|`->`| introduce entity score |
|`{}`| bloc of code, a compound value, an NBT tag |
|`[]`| selector conditions, block states, list values |
|`()`| coordinates, macro arguments, function/macro call |
|`.`| select entities with tag |
|`!`| select entities without tag |
|`*`| set scale and type when storing numbers to NBT data |
|`:`| namespace |
|`#`| tags for functions/entities/blocks, as set in JSON files |


## Keywords

### Selector keywords

| `keyword`             |  |
|---------------------|-------------|
| `arbitrary`           | selector.sorting
| `any`                 | slector.sorting
| `advancements`        | selector.condition
| `adventure`           | selector.gamemode
| `closest`             | sorting in selectors
| `creative`            | gamemode in selectors
| `distance`            | condition in selectors
| `farthest`            | sorting in selectors
| `furthest`            | sorting in selectors
| `gamemode`            | condition in selectors
| `limit`               | 
| `level`               | 
| `nbt`                 | 
| `nearest`             | 
| `oldest`              | 
| `predicate`           | 
| `random`              | 
| `scores`              | 
| `sort`                | 
| `spectator`           | 
| `survival`            | 
| `team`                | 
| `tag`                 | 
| `type`                | 
| `x`                   | 
| `x_rotation`          | 
| `y`                   | 
| `y_rotation`          | 
| `z`                   | 

### Execution context keywords
| `keyword`             |  |
|---------------------|-------------|
| `align`               | context.position
| `anchored`            | context.location
| `as`                  | context.entity
| `at`                  | context.position
| `back`                | context.direction.local
| `deg`                 | angle float suffix
| `down`                | execution position modifier 
| `downward`            | execution position modifier
| `east`                | execution position modifier
| `eyes`                | anchor argument
| `feet`                | anchor argument
| `forward`             | execution position modifier
| `in`                  | 
| `left`                | 
| `north`               | 
| `pos`                 | 
| `positioned`          | 
| `predicate`           | 
| `right`               | 
| `rot`                 | 
| `rotated`             | 
| `south`               | 
| `up`                  | 
| `upward`              | 
| `west`                | 
| `x`                   | 
| `xy`                  | 
| `xyz`                 | 
| `xz`                  | 
| `y`                   | 
| `yz`                  | 
| `z`                   | 

### Mclang keywords

| `keyword`             |  |
|---------------------|-------------|
| [`after`](#ttafter-interval-tt)               | (#ttafter-interval-tt)
| `and`                 | mclang.flow
| `else`                | control flow keyword
| `every`               | scheduling keyword
| `for`                 | execution context modifier
| `function`            | declaration
| `if`                  | 
| `import`              | 
| `json`                | 
| `macro`               | 
| `namespace`           | 
| `repeat`              | 
| `score`               | 
| `self`                | 
| `tag`                 | 
| `test`                | 
| `then`                | 
| `unless`              | 
| `until`               | 
| `var`                 | 
| `while`               | 

### Commands

| `keyword`             |  |
|---------------------|-------------|
| `append`              | nbt.operation
| `merge`               | 
| `bossbar`             | wrapped.bossbar
| `add`                 | wrapped.bossbar.subcommand 
| `remove`              | wrapped.bossbar.subcommand 
| `color`               | bossbar property
| `max`                 | bossbar property
| `name`                | bossbar property
| `players`             | bossbar property
| `style`               | 
| `value`               | bossbar property
| `visible`             | bossbar property
| `delete`              | synonym of remove
| `give`                | 
| `prepend`             | 
| `print`               | 
| `remove`              | 
| `say`                 | 
| `setblock`            | 
| `summon`              | 
| `tag`                 | 
| `untag`               | 

| `aqua`                | color
| `black`               | color
| `blue`                | color
| `b`                   | raw markup tag
| `d`                   | raw markup tag
| `dark_aqua`           | 
| `dark_blue`           | 
| `dark_gray`           | 
| `dark_green`          | 
| `dark_purple`         | 
| `dark_red`            | 
| `h`                   | 
| `i`                   | 
| `div`                 | 
| `gold`                | 
| `gray`                | 
| `green`               | 
| `light_purple`        | 
| `red`                 | 
| `reset`               | 
| `yellow`              | 
| `white`               | 
| `span`                | 


## Mclang Commands

Mclang has a small but growing set of commands that wrap the functionality of native Minecraft commands. 
### <tt>append *NBTpath* *value*</tt>
Append a value to a list at a NBTpath. The value can be anything that can be assigned to a NBT path. See [Working with NBT data](#working-with-nbt-data).

### <tt>bossbar add *id* *name*</tt>
Add a bossbar. Works exactly like in Minecraft. The namespace of the id defaults to the current namespace. S

### <tt>bossbar remove *id* </tt>
Removes a bossbar. Works exactly like in Minecraft. The namespace of the id defaults to the current namespace.

### <tt>merge *NBTpath* *value*</tt>
Merge a value with the value of NBTpath. The value can be a compound, a list of another NBTpath. See [Working with NBT data](#working-with-nbt-data).

| `append`              | nbt.operation
| `merge`               | 
| `bossbar`             | wrapped.bossbar
| `add`                 | wrapped.bossbar.subcommand 
| `remove`              | wrapped.bossbar.subcommand 
| `color`               | bossbar property
| `max`                 | bossbar property
| `name`                | bossbar property
| `players`             | bossbar property
| `style`               | 
| `value`               | bossbar property
| `visible`             | bossbar property
| `delete`              | synonym of remove
| `give`                | 
| `prepend`             | 
| `print`               | 
| `remove`              | 
| `say`                 | 
| `setblock`            | 
| `summon`              | 
| `tag`                 | 
| `untag`               | 

