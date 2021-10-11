- [mclang syntax](#mclang-syntax)
- [Functions and namespaces](#functions-and-namespaces)
  - [Defining functions](#defining-functions)
  - [Setting the namespace](#setting-the-namespace)
  - [Tagging functions](#tagging-functions)
- [Execution context](#execution-context)
  - [Shorter syntax](#shorter-syntax)
  - [Grouping commands](#grouping-commands)
- [Execution modifiers](#execution-modifiers)
  - [<tt>**for** *selector*</tt>](#ttfor-selectortt)
  - [<tt>**pos**</tt> and <tt>**rot**</tt>](#ttpostt-and-ttrottt)
  - [<tt>(**north**|**south**|**east**|**west**|**up**|**down**) *float*</tt>](#ttnorthsoutheastwestupdown-floattt)
  - [<tt>(**forward**|**back**|**left**|**right**|**upward**|**downward**) *float*</tt>](#ttforwardbackleftrightupwarddownward-floattt)
  - [<tt>(**left**|**right**|**up**|**down**) *float*<b>deg</b></tt>](#ttleftrightupdown-floatbdegbtt)
- [Variables and entity scores](#variables-and-entity-scores)
  - [Scope variables](#scope-variables)
  - [Entity scores](#entity-scores)
  - [Assignment](#assignment)
  - [Arithmetics](#arithmetics)
- [Working with NBT Data](#working-with-nbt-data)
  - [Assignment](#assignment-1)
  - [<tt>(**prepend**|**append**) *NBT_path* *data*</tt>](#ttprependappend-nbt_path-datatt)
  - [<tt>(**insert**) *index* *NBT_path* *data*</tt>](#ttinsert-index-nbt_path-datatt)
  - [<tt>(**merge**) *NBT_path* *data*</tt>](#ttmerge-nbt_path-datatt)
  - [<tt>(**remove**) *NBT_path* *value*</tt>](#ttremove-nbt_path-valuett)
- [Target selectors](#target-selectors)
  - [Selector conditions](#selector-conditions)
    - [<tt><b>@p</b> <b>@r</b> <b>@a</b> <b>@e</b></tt>](#ttbpb-brb-bab-bebtt)
    - [<tt><b>@[</b>*player_id*<b>]</b></tt>](#ttbbplayer_idbbtt)
    - [<tt><b>@</b>*type*</tt>](#ttbbtypett)
    - [<tt><b>@#</b>*entity_tag*</tt>](#ttbbentity_tagtt)
    - [<tt><b>[</b>*condition* *op* *value*<b>]</b></tt>](#ttbbcondition-op-valuebbtt)
    - [<tt><b>.</b>*tag*</tt>](#ttbbtagtt)
    - [<tt><b>!</b>*tag*</tt>](#ttbbtagtt-1)
    - [<tt><b>{</b>*NBT_data*<b>}</b></tt>](#ttbbnbt_databbtt)
    - [<tt><b>[-></b>*score_name* *op* *integer*<b>]</b></tt>](#ttb-bscore_name-op-integerbbtt)
  - [Sorting and limit](#sorting-and-limit)
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
- [Constants and macros](#constants-and-macros)

</div>

<div style="overflow:auto;padding-left:30px">

## mclang syntax
Mclang code is written in files with `.mclang` efile xtension. You can use IDE extensions for syntax highlighting and error reporting.

Use `//` to introduce comments. Anything between `//` and the end of the line is a comment and will be ignored by mclang.

Each .mclang file can contain mclang statements, as well as native minecraft commands for any functionality that is not included in mclang. Use `/command ....` to pass native commands through to minecraft.

Any statements in the root of the file (i.e. outside any functions) will be executed when the datapack is (re)loaded. The following index.mclang will display "Hello world" on load and do nothing else:
````
/say Hello world
````

## Functions and namespaces
### Defining functions
Each function is compiled to a .mcfunction file.

````
function hello() {
  /say Hello world!
}
````
This will create a function name "hello" in hello.mcfunction in your current namespace. The default namespace is `mclang_dev`, but you will want to change that if you plan to use your datapack with others.

### Setting the namespace
````
namespace tutorial
// applies from this point on

function hello() {
  /say Hello world!
}

//let's call it on load
hello() 

// or from the minecraft chat
/function tutorial:hello

````
### Tagging functions
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

function again_and_again #minecraft:tick {
  // will be called on every tick
}
````

## Execution context
### Shorter syntax
There is no `execute` and `run` in mclang. You simply write the execution modifiers (`as`, `at`, `positioned`, etc.) and commands without them. 
````
as @a /say hello
// each player says hello

as @a at @s summon_enemies()
// calls the function as and at each player
````
### Grouping commands
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
## Execution modifiers
You can use all builtin execution modifiers: `as`, `at`, ... Some additional modifiers are provided by maclang. See also if/unless/else statements below for an upgraded version of if/unless.

### <tt>**for** *selector*</tt>
Shorthand for to set the execution entity and position at the same time. 

````
for @e[distance=...3] { ... }

// is the same as  ...

as @e[distance=...3] at @s { ... }
````
### <tt>**pos**</tt> and <tt>**rot**</tt>

These are shorthands for `positioned` and `rotated`. They also work for `pos as` and `rot as`.

### <tt>(**north**|**south**|**east**|**west**|**up**|**down**) *float*</tt>
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

### <tt>(**forward**|**back**|**left**|**right**|**upward**|**downward**) *float*</tt>
Syntactic sugar for changing the execution position in the current entity's coordinate system.
```
at @p left 2 forward 3 do_something()

// ... is the same as ...

at @p positioned ^-2 ^ ^3 do_something()
```

### <tt>(**left**|**right**|**up**|**down**) *float*<b>deg</b></tt>
Syntactic sugar for changing the execution rotation.
```
at @p left 90deg up 30deg do_something()

// ... is the same as ...

at @p rotated ~-20 ~30 do_something()
```
Whitespace is not allowed between the number and `deg`.

## Variables and entity scores
Variables and entity scores can be used to store integers and do arithmetics on them.

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
... = @@storage_name::nbt.path          // Storage data
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

## Target selectors
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

#### <tt><b>@#</b>*entity_tag*</tt>
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

3.14f     // float
0f        // still float
0.0       // defaults to float
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
"{$variable}"               // expand variable name declared in mclang to the target objective
                            => "--my_ns-my_score"

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
* `<p>` will remove all whitespace directly on its inside, and ensure that there are exactly two newlines (i.e. an empty line) before and after its contents, except at beginning or end of raw text.
* `<span>` will remove all whitespace directly on its inside, and ensure that there is at most one space before and after its contents if there was any whitespace there in the code.

In all three cases, the spaces and newlines within the tag, but not directly adjacent to it will be preserved, but each line will be trimmed, i.e. all spaces at begnning and end of line removed. Text within the `text` attribute will be included as is.

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
