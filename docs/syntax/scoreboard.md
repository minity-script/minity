# Variables and entity scores
Minity provides intuitive syntax for setting and getting data from various Minecraft game objects, including the scoreboard, entity tags, bossbars and NBT data in entities, blocks and data storage.

Variables and entity scores can be used to store integers and do arithmetics on them. 

## Scoped identifiers
Variables, entity scores and entity tags need to be declared. The declared identifiers will not be used directly, they will be namespaced and scoped, so you don't need to worry about name clashes with other namespaces or functions.


## Variables

### **var** <small>[declaration](defs#declaration)</small>
### <code>**$**</code> <small>[punctuation](def#punctuation)</small>

<code>**var** <strong>$</strong>*[var_name](args#ident)*</code>

Declare a scoped variable.

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

## Entity scores

Entity scores are variables that can be stored on each entity. They are scoped like variables.

### **score** <small>[declaration](defs#declaration)</small>

<code>**score** *[score_name](args#ident)* *[score_objective](args#objective)*?</code>

Declare a scoped entity score. Score objective defaults to `dummy`.

### <code>**->**</code> <small>[punctuation](defs#punctuation)</small>
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

## Assignment

### <code>**=**</code> <small>[operator](defs#operator)</small>

<code>int_target **=** int_source</code><br>
<code>int_target **=** (scale **\***)? nbt_source</code><br>
<code>nbt_target **=** nbt_source</code><br>
<code>nbt_target **=** (scale **\***)? int_source</code>

<code>int_target = {variable|entity_score|bossbar_property}</code><br>
<code>int_source = {variable|entity_score|bossbar_property|[integer](values#integer)|[statement](defs#statement)}</code><br>
<code>nbt_target = {block_nbt|entity_nbt|storage_nbt}</code><br>
<code>nbt_source = {block_nbt|enity_nbt|storage_nbt|literal}</code><br>
<code>scale = [typed_number](values#typed_numbers)</code><br>


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
### <code>**?=**</code> <small>[operator](defs#operator)</small>

Or the success of conditionals or statements:
````minity
$foo    ?= test if ($a > $b) and unless ($b < 3)
@s->bar ?= /command ...
````
### <code>**<=>**</code> <small>[operator](defs#operator)</small>

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
<code>{variable|entity_score} **++**</code>


### <code>**--**</code> <small>[operator](defs#operator)</small>
<code>{variable|entity_score} **--**</code>

### <code>**+=**</code> <small>[operator](defs#operator)</small>
<code>{variable|entity_score} **+=** {variable|entity_score|integer}</code>

### <code>**-=**</code> <small>[operator](defs#operator)</small>
<code>{variable|entity_score} **-=** {variable|entity_score|integer}</code>

### <code>**\*=**</code> <small>[operator](defs#operator)</small>
<code>{variable|entity_score} **\*=** {variable|entity_score|integer}</code>

### <code>**/=**</code> <small>[operator](defs#operator)</small>
<code>{variable|entity_score} **/=** {variable|entity_score|integer}</code>

### <code>**%=**</code> <small>[operator](defs#operator)</small>
<code>{variable|entity_score} **%=** {variable|entity_score|integer}</code>

### <code>**>=**</code> <small>[operator](defs#operator)</small>
<code>{variable|entity_score} **>=** {variable|entity_score|integer}</code>

### <code>**&lt;=**</code> <small>[operator](defs#operator)</small>
<code>{variable|entity_score} **&lt;=** {variable|entity_score|integer}</code>


### **test** <small>[command](defs#command)</small>

