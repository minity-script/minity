#### `namespace <ns>`
Sets the current namespace. This is where all your functions will go.

#### `function <name> [<tags>] { <statements> }`
Creates the function in the current namspace. The statements will be compiled to native Minecraft commands and saved in `data/<namespace>/functions/<name>.mcfunction` 

#### `/<command>`
Send a native command to Minecraft. The command will include everything until the end of the line. String expansion applies to commands.

## Scoreboard

#### Named variables 

* **`var $<name> [= <value>]`**
* **`$<name>`**

````
var $my_var = 0
var $my_other_var
````

* Declares a named variable. 
* The variable will be namespaced to the namespace and function where it is declared, and shared between all the calls to the function.
* Variables that are not redeclared are inherited from parents scope.
* You can also assign a value to the declared variable. If you do not, the existing value will be preserved.

#### Entity score variables

* **`score <name> [<objective criterion>]`**
* **`<selector> -> <name>`**
````
score my_score
score my_trigger trigger
@p->my_score
@e[type=chicken]->evil
@s->time_left

````
* Declares a score variable. Score variables are stored on entities. 
* By default, scores will be stored as dummy objectives, but you can specify another objective.
* The score variable will be namespaced to the namespace and function where it is declared, and shared between all the calls to the function.
* Score variables that are not redeclared are inherited from parents scope.
* Use `@<selector> -> <name>` to access the score variable, e.g **`@s->my_score`**. The selector must return a single entity.

#### Variable assignment
* **`<entity_score|variable> = <value>`**
````
$my_var = 1
$my_var = $my_other_var
$my_var = my_function()
$number_of_players = /execute if entity @a 
$player_score = @p->my_score
@p->my_score = 0
@e[type=chicken]->evil = 100
````
* Assign a value to a variable or to an entity score on all entities that match the selector.
* The value must be an integer, or something that returns an integer. This includes numbers, variables, entity scores, function calls and commands.

#### Arithmetics on variables
* **`<variable|entity_score> ++`** 
* **`<variable|entity_score> --`**
* **`<variable|entity_score> += <value>`**
* **`<variable|entity_score> -= <value>`**
* **`<variable|entity_score> *= <value>`**
* **`<variable|entity_score> /= <value>`**
* **`<variable|entity_score> %= <value>`**
````
$my_var += 1
$my_var *= my_function()
@s->my_score %= $my_modulo
@e[type=chicken]->evil ++
$time_left --
````
* Assign a value to the score on all items that match the selector.
* The value must be an integer or something that is or returns an integer. This includes numbers, variables, entity scores, function calls and commands.

#### Range coercion
* **`<variable|entity_score> >= <value>`**
* **`<variable|entity_score> <= <value>`**
````
$my_var >= 3
@a->my_score <= $max_score
````
* Ensure that the variable or entity score is at least or at most the value.
* The value must be an integer or something that is or returns an integer. This includes numbers, variables, entity scores, function calls and commands.

#### Swap
* **`<variable|entity_score> <=> <variable|entity_score>`**
````
$my_var >= 3
@a->my_score <= $max_score
````
* Swap the values of two variables and/or entity scores

## Entity tags

* **`tag <name>`**
````
tag processed
````
  
* Declares an entity tag, which can be used to search for tagged entities.
* The entity tag will be namespaced to the namespace and function where it is declared, and shared between all the calls to the function.
* Entity tags that are not redeclared are inherited from parents scope.

#### Tagging and untagging entities

* **`tag <selector> <name>`**
* **`untag <selector> <name>`**
````
tag @s processed
untag @a completed
tag @chicken is_evil
````
* Declares an entity tag, which can be used to search for tagged entities.
* The entity tag will be namespaced to the namespace and function where it is declared, and shared between all the calls to the function.
* Entity tags that are not redeclared are inherited from parents scope.

#### Using tags in selectors

* **`<selector>(.<tag>|.!<tag>...)`**
````
@e.processed
@a.!completed
@chicken.is_evil
````

## Selectors

All builtin minecraft selectors should work out of the box. Some syntactic sugar is provided.

#### Type selector
* **`@<type>`**
* **`@#<type tag>`**
````
@item[distance=..2]
@custom_namespace:cusom_type 
  ==> @e[type=ns:type]
@#raider
````

### `.<tag>`

You can specify a named tag with a dot 

````
@a.is_cool 
@chicken.is_evil[distance=..20].!processed
````

#### Limits and sorting

````
nearest @a.is_cool 
furthest 3 @a
random 3 @chicken
````

## Execution modifiers

You can use most builtin execution modifiers (`as`, `at`, `positioned`, ...) to change how the statement(s) that follow them will work. You can group several statements with curly braces. A block function will be generated in a separate file and it will be called from your function.

#### Change current entity
* **`as <selector> <statement>`**
* **`as <selector> { <statements> }`**
````
  as @a /say hello

  as @a.!greeted {
    /say hello
    tag @s greeted
  }

````

You cannot use `store`, but see "assignments" for the alternative.

`if` and  `unless` have a special syntax, which can include `else`. See below for details.

Several shorthand modifiers are also provided, se below.

### `for`

A shorthand for `as` and `at`.

````
  # kill the nearest chicken to each player

  for @a as nearest @chicken /kill @s
    ==> execute as @a at @s as @e[type=minecraft:chicken]
````

### `up down north south east west` 
In addition to using the `positioned` modifier, you can use shorthand direction modifiers. Consecutive modifiers are consolidated into a single `positioned` modifier.

````
  # summon a slime slight above and well north of each player

  at @a down 1 up 2 north 20 /summon ~ ~ ~ slime
    ==> execute as @a at @s positioned ~-20 ~1 ~ /summon ~ ~ ~ minecraft:slime
````

## Criteria for `if` and `unless`
### Do any entities match the selector?
````
if @chicken {
  /say Found some chickens
}
==> execute if entity @e[type=minecraft:chicken] run say Found some chickens
````
### Scores 
````
for @p {
  if @s->found_items >= 10 {
    /say Found all items
  }
}
==> execute as @p at @s if score @s found_items matches 10.. run say Found all items

for @p {
  if @s->found_items > 10 {
    /say Found even more items
  }
}
==> execute as @p at @s if score @s found_items matches 10.. unless score @s found_items matches 10 run say Found even more items

for @p {
  if @s->found_items >= @s->items_count {
    /say Found all items
  }
}
==> execute as @p at @s if score @s found_items > @s items_count run say Found all items
````
### Match data
#### Match entity data
````
as @a {
  if @s::Inventory[{id:"minecraft:stone"}] {
     /say Got some stone
  }
}
==> execute as @p if data entity @s Inventory[{id:"minecraft:stone}] run say Got some stone
````

#### Match storage data
````
if $name /say Got some stored data
==> execute as @p if data storage mcl:vars name run say Got some stored data

if $ns:storage::path /say Got some stored data
==> execute as @p if data storage ns:storage path run say Got some stored data
````

## Commands

### `/command args ...`

