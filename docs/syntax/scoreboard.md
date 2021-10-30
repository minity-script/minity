# Variables and entity scores
Minity provides intuitive syntax for setting and getting data from various Minecraft game objects, including the scoreboard, entity tags, bossbars and NBT data in entities, blocks and data storage.

Variables and entity scores can be used to store integers and do arithmetics on them. 

## Scoped identifiers
Variables, entity scores and entity tags need to be declared. The declared identifiers will not be used directly, they will be namespaced and scoped, so you don't need to worry about name clashes with other namespaces or functions.


## Variables

### <code>**$**</code> <small>[punctuation](def#punctuation)</small>
<def>**$**[*var_name*](args#ident)</def>

Variable names are prefixed with `$`. The name can contain letters, numbers and underscores.

### **var** <small>[declaration](defs#declaration)</small>
<def>**var $**[*var_name*](args#ident) ( **=** [*integer*](values#integer) )?</def>

Declare a scoped variable.

To declare a variable, use the `var` keyword.
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

## Entity scores

Entity scores are variables that can be stored on each entity. They are scoped like variables.

### **score** <small>[declaration](defs#declaration)</small>

<def>**score** *[score_name](args#ident)* *[score_objective](args#objective)*?</def>

Declare a scoped entity score. 

By default scores use the `dummy` criterion, so they behave like regular integer variables. You can however specify a different criterion and take advantage of the full power of Minecraft's scoreboard system.


### <code>**->**</code> <small>[punctuation](defs#punctuation)</small>

Score values are accessed by connecting the entity selector and the score name with `->`

<def>[*selector*](selector)**->**[*score_name*](args#ident)</def>


````minity
var $foo
score hits

@p->hits = 10
$foo     = @p->hits
````

To select entities by score, use the `@e[->score_name <op> value]` selector condition. See selector syntax below.

## Assignment

### <code>**=**</code> <small>[operator](defs#operator)</small>

<def>*scoreboard_target* **=** *int_source*
*scoreboard_target* **=** (*scale* **\***)? *nbt_source*
<br>scoreboard_target = {*scoreboard_target*|*bossbar_property*}
scoreboard_target = {*variable*|*entity_score*}
<br>int_source = {*scoreboard_source*|*bossbar_property*|[*statement*](defs#statement)}
scoreboard_source = {*variable*|*entity_score*|[*integer*](values#integer)}
<br>nbt_source = {*block_nbt*|*enity_nbt*|*storage_nbt*|[*literal*](values)}
scale = [*typed_number*](values#typed_numbers)


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
### <code>**?=**</code> <small>[operator](defs#operator)</small>

<def>*int_target* **?=** [*statement*](defs#statement)</def>

You can store the success values of statements.

Or the success of conditionals or statements:
````minity
@s->bar ?= /command ...
````

### **test** <small>[pseudo-function](defs#pseudo-function)</small>
<def>**test** [*conditions*](flow-control#if)</def>

You can store result and success values of conditionals:
````minity
$foo    = test if ($a > $b) and unless ($b < 3)
$foo    ?= test if ($a > $b) and unless ($b < 3)
````
These are the values returned by `/execute {if|unless}` without `run`. See [native documentation](https://minecraft.fandom.com/wiki/Commands/execute#Condition_subcommands) for details.

### <code>**<=>**</code> <small>[operator](defs#operator)</small>

<def>*int_target* **&lt;=>** *int_target*</def>

You can swap the values of two variables and/or entity scores:
````minity
$foo >< $bar   // using minecraft's original syntax
$foo <=> $bar  // using minity's more conventional alternative
````

## Arithmetics
You can do basic arithmetics on variables and entity scores. The accepted operands for all operations are integers, variables and entity scores.
````minity
$foo <op> ...
@p->my_score <op> ...

... <op> 12
... <op> $foo
... <op> @s->my_score
````
### <code>**++**</code> <small>[operator](defs#operator)</small>
<def>*scoreboard_target* **++**</def>

**Increase** a variable or entity score by 1.

### <code>**--**</code> <small>[operator](defs#operator)</small>
<def>*scoreboard_target* **--**</def>

**Decrease** a variable or entity score by 1.

### <code>**+=**</code> <small>[operator](defs#operator)</small>
<def>*scoreboard_target* **+=** *scoreboard_source*</def>

**Add** the value of the source to a variable or an entity score. The source can be a variable, an entity score or an integer.

### <code>**-=**</code> <small>[operator](defs#operator)</small>
<def>*scoreboard_target* **-=** *scoreboard_source*</def>

**Subtract** the value of the source from a variable or an entity score. The source can be a variable, an entity score or an integer.

### <code>**\*=**</code> <small>[operator](defs#operator)</small>

<def>*scoreboard_target* **\*=** *scoreboard_source*</def>

**Multiply** a variable or an entity score by the value of the source. The source can be a variable, an entity score or an integer.

### <code>**/=**</code> <small>[operator](defs#operator)</small>
<def>*scoreboard_target* **/=** *scoreboard_source*</def>

**Divide** a variable or an entity score by the value of the source. The source can be a variable, an entity score or an integer. Note that this is integer division.

### <code>**%=**</code> <small>[operator](defs#operator)</small>
<def>*scoreboard_target* **%=** *scoreboard_source*</def>

Divide a variable or an entity score by the value of the source and **store the remainder**. The source can be a variable, an entity score or an integer. 

### <code>**>=**</code> <small>[operator](defs#operator)</small>
<def>*scoreboard_target* **>=** *scoreboard_source*</def>

Update the variable or an entity score to the value of the source **if it is larger** than the target. The source can be a variable, an entity score or an integer. 

### <code>**&lt;=**</code> <small>[operator](defs#operator)</small>
<def>*scoreboard_target* **&lt;=** *scoreboard_source*</def>

Update the variable or an entity score to the value of the source **if it is smaller** than the target. The source can be a variable, an entity score or an integer. 

