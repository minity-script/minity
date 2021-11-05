## Minity syntax

Minity code is written in files with the `.minity` file extension. Minity will parse your code and compile it into `.mcfunction` files in your datapack. Some minity statements will also produce or alter `.json` files in your datapack.

You can use IDE extensions for syntax highlighting and error reporting.

## Basic Syntax

Most minity syntax is concerned with naming of variables, accesing and assigning of data, arithmetics, and control structures. It is a complete replacement for .mcfunction commands `execute ... run`, `scoreboard` and `data`. 

Each .minity file can contain minity statements, as well as comments and native minecraft commands for any functionality that is not included in minity.

Any statements in the root of the file (i.e. outside any functions) will be executed when the datapack is (re)loaded. The following `index.minity` will display "Hello world" on (re)load and do nothing else:

````minity
````
Note that you must start every `.minity` file with a namespace declaration. See [Namespaces and Functions(#namespaces-and-functions) for details.

### Using native Minecraft commands
 Use `/command ....` to pass native commands through to minecraft.

````minity
/setblock ~ ~ ~ minecraft:stone
````
Minity has a small, but growing, set of builtin replacements for native commands, which allow you to easily use minity goodies like advanced selector syntax, variables, etc. See [Minity commands](#minity-commands) for details.

In other situations, when you have to or want to use native minecraft commands, minity can offer some help with replacement patterns in curly brackets:

````minity
/execute as {@armor_stand.is_marker} run say I'm a {?color} marker
=> execute as @e[type=armor_stand,tag=--my_ns-is_marker] run say I'm a red marker
````
See [argument interpolation](#argument-interpolation) for details.

### Comments
Use `//` to introduce comments. Anything between `//` and the end of the line is a comment and will be ignored by minity.
````minity
foo.bar {
  mar:ne;
}
// this is a comment
if $a > 3 setblock air // this is a comment too
````
The exception are native commands prefixed with `/` and a few minity commands that encapsulate "greedy" native commands like `/say` and `/tellraw`, which will eat up everything until the end of the line:
````minity
/setblock ~ ~ ~ minecraft:stone //not a comment, will throw syntax error in minecraft

say Everything's fine //also not a comment, it will be printed out in minecraft chat
````
### Importing minity files
Keeping your whole program in one file can become impractical, so you may decide to split into multiple files.
````minity
import "./helpers.minity"
import "./minigame.minity"
````
Some minity features (variables, macros, etc.) need to be declared or defined before they are used, the order of imports and where in your file you put them can be important.
<blockquote>
This requirement could be relaxed in the future.
</blockquote>

## Namespaces and functions
````minity
function hello() {
  /say Hello world!
}
hello() 
````
### Setting the namespace
Most minity statements requires a namespace to be set. This will among other things determine where `.mcfunction` files are located, and namespaced identifiers for your variables, scores, etc.
````minity
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

````minity
function hello() {
  /say Hello world!
}
````
This will create a function named "hello" in `hello.mcfunction` in your current namespace. Functions must go into namespaces, so they must appear after a namespace statement.
<blockquote>
Minity is currently quite particular about the placement of braces. It allows newlines inside them, but not before them, nor after them if the statement continues after the braces. You should generally follow the use of whitespace as shown in this documentation.

This might be relaxed in the future, but it must first be thoroughly tested for ambiguity.
</blockquote>

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
  /say Hello world!
}

namespace mypack

function greet() {
  tutorial:hello()
  /say It's a splendid morning
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
  /say Hello overworld!
}
function hello_nether() #greet {
  /say Hello nether!
}
#greet()                              // will call both greetings
````
The tag namespace defaults to the current namespace, but different namespaces can be provided.

````minity
function again_and_again #minecraft:tick {
  // will be called on every tick
}
````
## Execution context
### A replacement for `execute ... run`
There is no `execute` and `run` in minity. You simply write the execution modifiers (`as`, `at`, `positioned`, etc.) and commands without them. 
````minity
as @a /say hello
// each player says hello

as @a at @s summon_enemies()
// calls the function as and at each player
````
### Grouping commands
If you need to do several things in the same execution context (i.e. current entity, position, rotation, etc.), put them in `{}` braces. 

You don't have to use `()` brackets around the arguments to execution modifiers, but you can if it helps you make sense of your code.
````minity
as (@a)  { 
  /kill @s
  /say R.I.P.
  at (@s) build_grave()
}
// each player dies, then says R.I.P.
// then we call our function to build
// a grave where the player died
````
Statements within braces will be put in an *anonymous function* which will be saved under a unique name in the `zzz_minity` namespace. This guarantees that all statements in the block (including subfunctions) will be called with the same execution context, even if anything changes in between. Compare the two different cases below:

````minity
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
### Native execution context modifiers
#### <tt>as</tt>
Selects the matching items, and runs the following statement(s) for each of them, setting the current entity (`@s`) to each matching entity in turn. 
````minity
as @e[distance=...3] { 
  tag @s is_near
}
````
#### <tt>at</tt>
Selects the matching items, and runs the following statement(s) at each of their positions and rotations in turn, without changing the current entity. 
````minity
as @e[distance=...3] { 
  tag @s is_near
}
````
#### <tt>for</tt>
Shorthand for setting the execution entity and position at the same time. 
````minity
for @e[distance=...3] { ... }

// is the same as  ...

as @e[distance=...3] at @s { ... }
````
#### <tt>positioned</tt>
Changes the current execution position, thus changing the meaning of relative coordinates in the following statement(s):
````minity
positioned 0 0 0 { 
  // ~ ~ ~ is now at world origin
}
positioned ~ ~3 ~ { 
  // ~ ~ ~ is now three blocks above
}
````
You will probably use this only for absolute coordinates, because minity provides a more convenient way to change position with direction modifiers.

#### <tt>rotated</tt>
Changes the current execution position, thus changing the meaning of local coordinates in the following statement(s):
````minity
rotated 0 0 { 
  // looking straight north
}
rotated ~ ~30 { 
  // rotate 30 degrees upwards
}
````
You will probably use this only for absolute rotation, because minity provides a more convenient way to change rotation with direction modifiers.

#### <tt>anchored</tt>
Changes the current execution position and rotation to match that of the current item's eyes or feet.

#### <tt>align</tt>
Rounds down the current coordinates in the chosen axes. Note that you must specify the axes in the correct order, unlike in `.mcfunction`
````minity
align xyz ...   // align in all three axes
align xz ...    // align in horizontal axes
align xzy ...   // error, you must sort the axes corretly
````
### Minity coordinate modifiers
#### <tt>north
#### <tt>east west</tt>
#### <tt>up down</tt>

Syntactic sugar for changing the execution position in relative world coordinates.
````minity
at @p up 2 do_something()

// ... is the same as ...

at @p positioned ~ ~2 ~ do_something()
````
Consecutive shorthand position modifiers will be combined:
````minity
at @p up 2 west 3 down 4 do_something()
// ... is the same as ...
at @p positioned ~ ~-2 ~3 do_something()
````
#### Local direction modifiers: <tt>(**forward**|**back**|**left**|**right**|**upward**|**downward**) *float*</tt>
Syntactic sugar for changing the execution position in the current entity's coordinate system.
````minity
at @p left 2 forward 3 do_something()

// ... is the same as ...

at @p positioned ^-2 ^ ^3 do_something()
````
#### Rotation modifiers: <tt>(**left**|**right**|**up**|**down**) *float*<b>deg</b></tt>
Syntactic sugar for changing the execution rotation.
````minity
at @p left 90deg up 30deg do_something()

// ... is the same as ...

at @p rotated ~-20 ~30 do_something()
````
Whitespace is not allowed between the number and `deg`.

## Conditionals

### <tt>(**if|unless)** *condition* /  ... [**else** ...]</tt>
````minity
if $a > 3 {
  say Larger than 3
} 
unless $a > 3 {
  say Not larger than 3
}
````
### Else 
Minity provides a true else, by pushing results of tests to a stack in data storage and running the else statement(s) only if the test originally failed. The following example will work completely as expected.
````minity
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
````
### Combining conditionals
````minity
$a = 4

if $a > 3 and unless $a > 5 {
  say Just right!
} else {          
  say Outside range
} 
````
Minecraft doesn't provide logical operators (AND, OR, etc.), but it does allow chaining of if/unless. The `and` keyword is needed to ensure that `else` blocks apply to the correct conditions:
````minity
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
````
### Supported test conditions
#### Compare integers
You can compare variables, scores and integer values.

The allowed operators are `== != < <= > >=`
````minity
if $a > 3 ...
if ( $a < @s->my_score ) ...  // you can use brackets if you prefer
if @s -> my_score == 3 ...
if ($a == 1..4) ....          // works with ranges
````
##### Test a single block
To test for a block, you need to provide a block predicate, possibly preceded by a coordinate or directions. The block predicate can be as little as the id of the block. The block id can be namespaced, and the namespace defaults to `minecraft:`.
````minity
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
````minity
for @player {
  if @chicken.evil[distance<20] {
    say There are evil chickens nearby!
  }
}
````
#### Test for existence of NBT data
Provide a data path. Not that this only tests for existence of data, not truthiness.
````minity
if @s::Inventory[{id:stone}]        // does this entity have any stone
if @@my_storage::foo                // test storage data
if (up 2)::Items[{id:stone}]        // test block nbt data

if @s::Invulnerable                 // true if the path has any value, even if it's 0 or false 
````
#### Test predicate
````minity
if predicate my_predicate             // test my_predicate
if predicate other_ns:my_predicate    // you can use predicates from other namespaces
````
## Loops and scheduling
### <tt>**repeat** ... (**while**|**until**) *condition* ... [**then** ...] </tt>
Repeat the statements until the test is true or false.

````minity
var $count = 1
repeat {
  // this will repeat 10 times
  $count ++
} while ($count<=10)
````
If the statements within the loop are preceeded with subcommands, they will be applied on each loop:
````minity
repeat forward 0.1 {
  // will move forward on each step as long as the current block is air
} while air
````
You can combine several break conditions:
````minity
$count = 0;
repeat forward 0.1 {
  // will move forward on each step until stone is found stopping after at most 100 tries
  $count++
} until stone and while $count < 100 
````
If you provide a `then` statement, it will be run in the context of the last loop:

````minity
$count = 0;
repeat forward 0.1 {
  $count++
} until stone and while $count < 100 then {
  if(stone) say Stone found!
}
````
### <tt>**every** *interval* ... [(**until**|**while**) *condition*]</tt>
Run your statements at a regular interval.

````minity
every 300s {
  say Another 5 minutes have passed.
}

every 5t {
  // expensive operations that we want to run regularly, but not on every tick
}
````
You can provide break conditions that will stop the repetition:
````minity
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
````minity
as nearest @chicken.evil {    // run following commands as the nearest chicken
  say I am evil
  every 1s {
    say "I am still evil"           
    // the current entity here is the Server, not the chicken
  }
}
````
If you provide a `then` statement, it will be run when the repetition ends:
````minity
every 1t {
  minigame_on_tick()
} while ($running == true) then {
  say Game Over
}
````
### <tt>**after** *interval* ...</tt>
Run your statements once after an interval has passed.
````minity
after 3600s {
  say You've been playing for an hour
}
````
## Constants and macros
### Constants
You can define compile time constants, which you can then use anywhere in your code where a value is expected.
````minity
?my_constant       = 12
?my_other_constant = "foo"

$a = ?my_constant
````
### Macros 
You can also define compile-time macro frunctions and pass arguments to them. The passed values will be usable inside the macro.

````minity
macro give_items(?id, ?count=1, ?damage=0b) {
  give @s ?count ?id{Damage:?damage}
}

as @a give_items( torch, 5 )            // give each player 5 torches

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
````minity
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

````minity
macro raycast_destroy(?block) {
  unless(block) {
    forward 0.1 self()
  } else {
    setblock air
  }
}
raycast_destroy(stone)
````
Note that this will run forever, i.e. until Minecraft cuts off execution at 65,535 commands, if no stone is found, so it's not a good enough solution for raycasting by itself. See below for a better solution.

## Macros as Promises
### Defining a promiseful macro
#### <tt>**reject()**</tt> and <tt>**resolve()**</tt>
Any macro can become "promiseful" by including `resolve()` and/or `reject` pseudo-function calls. These will include `then` and `catch` clauses when the macro is compiled into a function.
````minity
macro find_block (?block, ?distance = 5 ) {
  var $count = ?distance
  $count *= 10
  repeat forward 0.1 {
    $count--
  } while air and while $count > 0 then {
    if(?block) {
      resolve()           //include the then clause
    } else {
      reject()            //include the catch clause
    }
  }
}
````
### Using a promiseful macro
#### <tt>**when**</tt> and <tt>**except**</tt>
Use the `when` construct to run some code in the execution context and at the time as provided by the macro.
````minity
function stone_destroyer() {
  when find_block (stone) then {
    setblock air
  }
}
````
To invert the meaning of `reject` and `resolve` in the compiled macro, use `except`:
````minity
function stone_seeker() {
  except find_block (stone) then {
    say No stone found!
  }
}
````
#### <tt>**then**</tt> and <tt>**catch**</tt>
`when` and `except` clasuse are followed by a `then` clasue and an optional `catch` clause.
````minity
when find_block(stone) then {
  setblock air
} 
except find_block(stone) then {
  say No stone found!
} catch {
  setblock air
}
````
#### Chaining promises
Like `if/else` and `while/until`, you can chain `when` and `except` promises with the `and` keyword.

Chained promises will call each other in turn. If any of them rejects the promise, the `catch` clause will be called and the chain cut short, otherwise the `then` clause will be called.
````minity
when find_block(stone) and when morning_only then {
  say There's some morning rock!
} catch {
  say Now's not the time or place for that bad joke
}

// is the same as:

when find_block(stone) then {
  when morning_only then {
    say There's some morning rock
  } catch {
    say Now's not the time or place for that bad joke  
  }
} catch {
  say Now's not the time or place for that bad joke
}
````
#### Optional `()` brackets
If your macro doesn't require any parameters, you can omit the `()` brackets in `when`/`except` constructs:
````minity
macro morning_only () {
  var $time;
  $time = /time query daytime

  if $time == 1000..5999 then() 
}

when morning_only then say Good morning!
````
### Execution context and identifier scope in promises
The `then` and `catch` clauses are compiled in their *lexical scope*, i.e. in the scope of the function and namespace where they are written in the code, and that is where they inherit the declared variables, score names and tags from.

OTOH, they are run in whatever execution context (current entity, position, rotation, dimension) the macro called `reject()` or `resolve()`

## Variables and entity scores
Variables and entity scores can be used to store integers and do arithmetics on them. 

Varuables and entity scores need to be declared. The declared identifiers will not be used directly, they will be namespaced and scoped, so you don't need to worry about naming clashes with other namespaces or functions.

### Integer variables
To declare a variable, use the `var` keyword. Variable names are prefixed with `$`
````minity
var $my_var = 0
var $my_other_var
````
The variable will be namespaced to the namespace and function where it is declared, and shared between all the calls to the function. Variables that are not redeclared are inherited from parent scope.

````minity
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
````minity
function foo() {
  score my_score 
  //separate from global my_score
}
````
Score values are accessed by connecting the entity selector and the score name with `->`

````minity
var $foo
score hits

@p->hits = 10
$foo     = @p->hits
````
By default scores use the `dummy` criterion, so they behave like regular integer variables. You can however specify a different criterion and take advantage of the full power of Minecraft's scoreboard system.
````minity
````
To select entities by score, use the `@e[->score_name <op> value]` selector condition. See selector syntax below.
### Assignment
Anything that is or returns an integer can be assigned to a variable or an entity score.
````minity
$foo = ...
@p->my_score = ...

... =  @p->my_score
... = $foo
... = @p::Inventory[{Slot:1b}].Count   // Entity data
... = (up 2)::Items[{Slot:1b}].Count   // Block data
... = @@storage_name::nbt.path         // Storage data
... = bossbar my_bossbar max           // Bossbar properties (max, value, visible)
````
You can also use any native command or minity statement:
````minity
$foo    = function_name() 
@s->bar = /command ...
````
You can store results of conditionals:
````minity
$foo    = test if ($a > $b) and unless ($b < 3)
@s->bar = /command ...
````
Or the success of conditionals or statements:
````minity
$foo    ?= test if ($a > $b) and unless ($b < 3)
@s->bar ?= /command ...
````
You can swap the values of two variables and/or entity scores:
````minity
$foo >< $bar   // using minecraft's original syntax
$foo <=> $bar  // using minity's more conventional alternative
````
### Arithmetics
You can do basic arithmetics on variables and entity scores. The accepted operands for all operations are integers, variables and entity scores.
````minity
$foo <op> ...
@p->my_score <op> ...

... <op> 12
... <op> $foo
... <op> @s->my_score
````
The accepted operations are:
````minity
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

````minity
````
Use `tag` and `untag` to add and remove tags from entities:
````minity
tag @chicken evil
untag @s processed
````
Tags are namespaced and scoped to the local function.
````minity
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
````minity
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
````minity
@s::NoAI                        // entity data
(0 0 0)::Items[{Slot:1}]       // block data
@@ns:storage_name::nbt.path     // storage data, ns is optional and defaults 
                                // to the current namespace
@@nbt.path                      // shorthand for @@current_ns:minity_vars storage
````
### Assignment
You can assign anything to a data path, subject to limitations imposed by Minecraft itself.
````minity
@s::Pos[0]                          = ...
(up 2 north 3)::Items[{Slot:1}]     = ...
@@storage_name::my.stored.value     = ...
@@my.stored.value                   = ...
````
In addition to all integer sources accepted by variable assignment, NBT paths accept strings, typed numbers, and structured NBT data, as well as NBT paths.
````minity
... = "My Entity"
... = 12d
... = { numbers: [ "zero", "one", "two", "three" ] }
... = @s::Inventory[{Slot:1b}].Count
````
You can assign NBT paths to variables and entity scores. The value assigned will depend on the content of the NBT path, as returned by native `data get` command.
````minity
$value_of_number       = @s::MyNumber
$length_of_string      = @s::MyString
$length_of_list        = @s::MyList
$number_of_child_tags  = @s::MyCompound

... = 12d
... = { numbers: [ "zero", "one", "two", "three" ] }
... = @s::Inventory[{Slot:1b}].Count
````
When assigning values between NBT paths and variables or entity scores, you sometimes need to specify the data type or scale the value. This is most commonly used in entity and block data, where Minecraft accepts only a certain type of number, e.g. byte or double.
````minity
@s::Invulnerable = 1b * @s->is_divine
@s::Pos[1]       = 1d * @s->stored_altitude
$scaled_size     = 8 * @@stored_size
````
### <tt>(**prepend**|**append**) *NBT_path* *data*</tt>
Prepend and append data to NBT lists. 
````minity
@s::MyList = ["A String"]
append @s::MyList "Last String"
prepend @s::MyList "First String"
    // the list is now ["First String","A String","Last String"]
````
Accepts value sources accepted by NBT Path assignment.

### <tt>(**insert**) *index* *NBT_path* *data*</tt>
Insert data into lists.
````minity
@s::MyList = ["First String"]
append @s::MyList "Last String"
insert 1 @s::MyList "A String"
    // the list is now ["First String","A String","Last String"]
````
### <tt>(**merge**) *NBT_path* *data*</tt>
Merge the supplied value or the content of source path to the target path.
````minity
merge @s::MyList ["Another String"]
merge @p::AchievedQuestSteps @s::GrantQuestSteps
````
### <tt>(**remove**) *NBT_path* *value*</tt>
Remove data at the target path.
````minity
@s::MyList = ["A String"]
append @s::MyList "Last String"
prepend @s::MyList "First String"
    // the list is now ["First String","A String","Last String"]
````
## Advanced target selectors
All valid minecraft selectors should work in minity. The only exception are bare player ids, which are instead accepted in the form of `@[player_id]`

In addition, syntactic sugar is provided for some selector conditions. Similar to css, multiple conditions can be applied in series, as long as there is no whitespace betwen them. See below for the conditions that you can apply this way.
### Selector conditions
````minity
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

````minity
as @[yockz] {...}      => execute as yockz run ...

@armor_stand  // match all armor stands
              => @e[type=armor_stand]
````
#### <tt><b>@</b>*type*</tt>
Sets the `type` condition of the selector. The type can include a namespace, if not, it defaults to `minecraft`.

````minity
@item         // match all item entities   
              => @e[type=item]

@armor_stand  // match all armor stands
              => @e[type=armor_stand]
````
This will set the *target selector variable* to `@e`, and will match all live entities of the given type. This means that `@player` will match only live players, and you need to use `@a` if you want to target dead players as well. 

#### <tt><b>@#</b>*entity_type_tag*</tt>
Sets the `type` condition of the selector. If namespace is not provided, it defaults to `minecraft`.
````minity
@#raider            // match all raiders                       
                    => @e[type=#minecraft:raider]
@#my_pack:enemies   // match all enemies tagged in a datapack
                    => @e[type=#my_pack:enemies]
````
This will set the *target selector variable* to `@e`. See above.

#### <tt><b>[</b>*condition* *op* *value*<b>]</b></tt>
Match entities for which the test in the brackets is true. The condition is one of the native target selector conditions. The accepted values and allowed comparison operators depend on the condition.

* Allowed for all conditions:
````minity
@e[team = my_team]   // test if condition matches value
@e[team == my_team]  // alias of =, for consistency with minity syntax
                     => @e[team = my_team]
````
* Allowed for some conditions, see Minecraft documentation:
````minity
@e[team =! my_team]  // negates the condition, only allowed for some conditions
@e[team != my_team]  // alias of =!, for consistency with minity syntax
                     => @e[team =! my_team]
````
* Allowed for conditions that accept ranges:
````minity
@e[level >= 10 ]     => @e[level=10..]
@e[level >  10 ]     => @e[level=11..]
@e[level <= 10 ]     => @e[level=..10]
@e[level <  10 ]     => @e[level=..9 ]
````
#### <tt><b>.</b>*tag*</tt>
Sets the `tag` condition. Can be used multiple times. Uses namespaced tags declared in the current scope.
````minity
@a.newby                // match players with the `newby` tag in the current scope
                        => @e[tag=--my_ns-newby]
@item.special.key       // match items that have both tags
                        => @e[tag=--my_ns-special,tag=--mcl-my_ns-key]
if @s.special { ... }   // run statements if the current entity is special
                        => execute if @s[tag=--mcl-my_ns-special] run ...
````
#### <tt><b>!</b>*tag*</tt>
Sets the `tag` condition to exclude the tag. Uses namespaced tags declared in the current scope.
````minity
@e!special            // match items that are not tagged `special`
                      => @e[tag=!--my_ns-special]

@e.special!processed  // match items that are special but not yet processed
                      => @e[tag=--my_ns-special,tag=!--my_ns-my_func_processed]
````
#### <tt><b>{</b>*NBT_data*<b>}</b></tt>
Sets the `nbt` condition to the provided data. Can be used multiple times.

````minity
@e{Invulnerable:1b}    // match all invulnerable items
                       => @e[nbt={Invulnerable:1b}]
````
#### <tt><b>[-></b>*score_name* *op* *integer*<b>]</b></tt>
Match an entity score by setting the the `scores` condition. Uses namespaced score names declared in the current scope. The value must be a literal integer.

````minity
                     // match all players with scores matching
@a[->foo == 10]      => @a[scores={--my_ns-foo=10}]
@a[->foo == 1..10]   => @a[scores={--my_ns-foo=1..10}]
@a[->foo >= 10]      => @a[scores={--my_ns-foo=10..}]
@a[->foo > 10]       => @a[scores={--my_ns-foo=11..}]
@a[->foo <= 10]      => @a[scores={--my_ns-foo=..10}]
@a[->foo < 10]       => @a[scores={--my_ns-foo=..9}]
````
Can be repeated to match several scores:
````minity
@a[->foo == 10][->bar < 100]  => @a[scores={--my_ns-foo=10,--my_ns-bar=..99}]
````
### Sorting and limit
In addition to using the native `sort` and `limit` parameters, you can prefix the selector with the sort order and optional limit.
````minity
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

Minity will accept standard minecraft coordinates (e.g. `~3 ~ ~2` or `^ ^ ^0.1`), but You can also use named directions in `()` brackets wherever a coordinate is expected, as long as all the directions are in the same coordinate system:
````minity
  setblock ^ ^ ^1 stone
  setblock (forward 1) stone
  setblock (forward 1 north 2) stone   // won't work, mixing different coordinate systems
````
Most minity commands that accept coordinates will default to the current position, so these two will have the same effect, though they will compile slightly differently:
````minity
  setblock (forward 1) stone
    ==> setblock ^ ^ ^1 stone
  
  forward 1 setblock stone
    ==> execute positioned ^ ^ ^1 run setblock ~ ~ ~ stone
````
The same works for rotations, though you are even less likely to need to specify a rotation:
````minity
  setblock (forward 1) stone
    ==> setblock ^ ^ ^1 stone
  
  forward 1 setblock stone
    ==> execute positioned ^ ^ ^1 run setblock ~ ~ ~ stone
````
## Minity Commands

Minity has a small but growing set of commands that wrap the functionality of native Minecraft commands. Some are just simple wrappers, others provide nicer syntax and/or additional functionalities. 

Any new commands will be documented here when they are added. 

If the comamnd you need is not provided by Minity yet, you can [use native minecraft commands](#using-native-minecraft-commands), possibly with [argument interpolation](#argument-interpolation).

It is the goal of Minity to cover most, but not all Minecraft commands. Some are not usable in functions. Others may be low-priority because they have convoluted syntax, and implementing wrappers for them will be a challenge, and may not provide much help to the programmer apart from removing the slash at the beginning of the line.

Note that the functionality of `execute`, `scoreboard` and `data` commands is suported with other Minity constructs and they are not intended on purpose.

<blockquote>
<b>IMPORTANT NOTICE:</b> Minity doesn't allow functions and macros to have the same names as Minity keywords. To future-proof your programs, avoid naming your functions and macros the same as any native minecraft command or any of its major subcommands, beacuse these couled eventually be used as keywords by Minity.
</blockquote>

### <tt>append *NBTpath* *value*</tt>
Append a value to a list at a NBTpath. The value can be anything that can be assigned to a NBT path. See [Working with NBT data](#working-with-nbt-data).

### <tt>bossbar add *id* *name*</tt>
Add a bossbar. Works exactly like in Minecraft. The namespace of the id defaults to the current namespace. See also [Bossbars](#bossbars).

### <tt>bossbar remove *id* </tt>
Remove a bossbar. Works exactly like in Minecraft. The namespace of the id defaults to the current namespace. See also [Bossbars](#bossbars).

### <tt>clear *target*? *count*? *item_id*{*NBT_compound*?} </tt>
Remove items from an entity's or entities' inventory. Works just like in .mcfunction, but with a slightly more readable order of arguments. 

Target defaults to `@s`, count defaults to 1.
````minity
clear 3 diamond{          // no space allowed between item id and NBT, 
  tag:{ special:true }    // just like in minecraft, but you can break your 
}                         // long values over several lines
````
### <tt>give [*target*] [*count*] *item_id*[*NBT_compound*] </tt>
Give items to an entity or entities. Works just like in .mcfunction, but with a slightly more readable order of arguments. 

Target defaults to `@s`, count defaults to 1.
````minity
give 3 diamond{          // no space allowed between item id and NBT, 
  tag:{ special:true }    // just like in minecraft, but you can break your 
}                         // long values over several lines
````
### <tt>merge *NBTpath* *value*</tt>
Merge a value with the value of NBTpath. The value can be a compound, a list of another NBTpath. See [Working with NBT data](#working-with-nbt-data).

### <tt>prepend *NBTpath* *value*</tt>
Prepend a value to a list at a NBTpath. The value can be anything that can be assigned to a NBT path. See [Working with NBT data](#working-with-nbt-data).

### <tt>print [*target*] *raw_text*</tt>

A wrapper for tellraw. The text will be parsed as if it is *already within* a `<span>` tag, which means that you can use raw tag markup in the text, but don't have to wrap it in a tag:
````minity
print This is a <b>very</b> important message. There is {$time_left} time left.
````
This is a *greedy command*, so it will print all the characters until the end of the line. Target defaults to the current entity. 

### <tt>say *text*</tt>

A trivial wrapper for the native `/say` command. 
````minity
say Hello!
````
This is a *greedy command*, so it will print all the characters until the end of the line. 
<blockquote>
This should maybe allow raw text as well, and behave the same as `print @a`
</blockquote>

### <tt>setblock [*position*] *block_id*[*NBT_compound*] [**then** ...]</tt>
Summon an entity, then potentially do something with it. 

Target defaults to the current entity, position defaults to the current position. You can provide a `then` block which will be run as tee summoned entity.
````minity
summon slime{               // no space allowed between item id and NBT
  Invulnerable:true
} then {              
  say I was summoned        
  say But now I will die
  /kill @s                  // the current entity here is the summoned slime
}                
````
### <tt>summon [*position*] *entity_type*[*NBT_compound*] [**then** ...]</tt>
Summon an entity, then potentially do something with it. 

Target defaults to the current entity, position defaults to the current position. You can provide a `then` block which will be run as tee summoned entity.
````minity
summon slime{               // no space allowed between item id and NBT
  Invulnerable:true
} then {              
  say I was summoned        
  say But now I will die
  /kill @s                  // the current entity here is the summoned slime
}                
````
### <tt>tag *selector* *tag*</tt>

Add a namespaced tag to the selected entities. 
````minity
tag @item[distance<=5] nearby

  ==> tag add @
````
### <tt>untag *selector* *tag*</tt>

Remove a namespaced tag from the selected entities. 
````minity
untag @player.processed 
````
## Advancement events (experimental)

<blockquote>
<b>WARNING - EXPERIMENTAL FEATURE:</b> - This is not necessarily well thought out and will likely be removed or completely reworked. Use only for testing for now.

The same functionality could be achieved with a general construct for defining JSON files from Minity source and some macro magic. Alternatively, Minity could provide a better event system which would include score objective events.
</blockquote>

To run your code when a specific thing happens in the game:
````minity
on player_killed_entity{   // no whitespace allowed before the NBT tag opening brace
  entity: {
    id: "minecraft:slime"
  }
} then {
  say I killed a slime       // @s is the player that killed the entity,
                             // so this is said by that player
} 
````
This will create an advancement with a single criterion, using the supplied trigger and conditions. When the event occurs, i.e. the advancement is granted, the `then` statement(s) will be run and the advancement revoked, allowing the event to be detected again.

## Values and types
Minity supports all the values supported by NBT tags. Like in .mcfunction, they are written in JSON-like syntax, with some relaxations, e.g. keys in compounds don't have to be quoted

### Numbers

#### Integer

Any integer value. Can include the sign.
````minity
+1
-100
````
#### Float

Any float value. Can include the sign and/or an exponent. In contexts where float values are implied, an integer value will be accepted as well.
````minity
3.14
+6.02E23
-273.4
42
````
#### Typed Numbers

In some contexts, notable when dealing with NBT data, typed numbers are required. The type of the number is specified by a suffix letter for each type.
````minity
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
````minity
"my name"                 // an ordinary string
"\n \" \u2312 "           // accepts standard escape sequences
````
#### Replacement patterns

Some bracketed sequences have a special meaning within doublequoted strings. These are all expanded by minity during compilation. They can be used anywhere where strings are accepted in the code.

### List
List is the NBT equivalent of a JSON array. Its items are listed inside square brackets separated by commas. Can contain items of any NBT type.
````minity
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
### Compound
Compound is the equivalent of a JSON object. It contains key-value pairs, listed within curly braces. Keys must be strings, values can be of any NBT type.

````minity
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
````minity
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

````minity
snbt 1b                     => "1b"
snbt true                   => "1b"
snbt "name"                 => '"name"'
snbt [a,b,c]                => '["a","b","c"]'
snbt [1,2,"not_a_number"]   // not allowed
````
### Raw Text Markup
Raw Text is a powerful feature of Minecraft, but also notoriously hard to write. The ability for array and objects to span across multiple lines can help to an extent. But minity can make it even easier for you, by using raw text markup, which is similar to HTML.

````minity
<div>
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
</div>
````
<blockquote>
<tt><b style="color:red">My <i>very</i>  Red Book</b></tt><br/><br/>
<tt>This book is red,</tt><br/>
<tt>but <span style="color:green">this text is green.</tt><br/>
<tt>Click <u style="color:blue">here</u> to say something.</tt><br/>
</blockquote>

You can use any tag names, as long as opening and closing tags match, but some tags hava aspecial meaning. Tags can be self-closing, which usually means tha they will display the value of the `text` attribute, if any.

#### Attributes
Attributes within tags directly set the properties of the raw text object. They accept any JSON value. Refer to raw text documentation for properties and values you can use.
````minity
<span 
  text="click me" 
  underline=true 
  clickEvent = {
    action: command,
    command: "/say you clicked me"
  }
/>
````
* `<div>` or `<d>` will remove all whitespace directly on its inside, and ensure that there is exactly one newline before and after it, except at beginning or end of raw text.
* `<p>` will remove all whitespace directly on its inside, and ensure that there is exactly one newline before it and two after it, except at beginning or end of raw text.
* `<h>` is like `<p>`, but with bold already applied.
* `<span>` or `<t>`will remove all whitespace directly on its inside. This also applies to all other tags.

In all cases, the spaces and newlines within the tag, but not directly adjacent to the tag will be preserved, but each line will be trimmed, i.e. all spaces at begnning and end of line removed. Text within the `text` attribute will be included as is.

* `<reset>` removes all formatting
* `<i>` italic
* `<b>` bold
* `<u>` underlined
* `<s>` strikethrough
* `<o>` obfuscated
* `<red>, <blue>, ...` Text color. See minecraft documentation for alloed color names.

#### Raw text objects vs. raw text JSON strings
Raw text markup will produce JSON objects which will be output as valid JSON in compiled code. In some cases, Minecraft expects raw text to be specified as a JSON string. To turn raw markup into a json string, use the `json` keyword:
````minity
summon chicken{
  CustomName: json <red>Evil Chicken</red>
}

  ==> summon minecraft:chicken{CustomName:'{"text":"","color":"red","others":["Evil Chicken"]}'}
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
