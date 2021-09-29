## Selectors

All builtin minecraft selectors should work out of the box. Additionally:

### `@type`

In addition to single-letter selectors, you can specify a (possibly namespaced) entity type. 

TODO: Accept entity #tags.
````
@item[distance=..2]
  ==> @e[type=minecraft:item,distance=..2]

@namespace:my_type 
  ==> @e[type=ns:type]

TODO:

@#villager 
  ==> @e[type=#minecraft:villager] 
````

### `.tag`

You can specify a scoreboard tag with a dot 

````
# select cool players
@a.is_cool 
  ==> @a[tag=is_cool]

# select cool players nearby
@a.is_cool[distance=..20]
  ==> @a[tag=is_cool,distance=..20]

````

### Limits and sorting

````
# nearest cool player
nearest @a.is_cool 
  ==> @a[tag=is_cool,sort=nearest,limit=1]

# furthest 3 players
furthest 3 @a
  ==> @a[sort=furthest,limit=3]

````

## Execution modifiers

You can use most builtin execution modifiers (`as`, `at`, `positioned`, ...) to change how the following statements work.


````
  as @a /say hello
    ==> execute as @a run say hello

  as @a at @s /summon minecraft:slime
    ==> execute as @a at @s /summon minecraft:slime
````
You can group several statements with curly braces. A block function will be generated in a separate file and it will be called from your function.

````
  as @a {
    /say Going to die
    /kill @s
  }

  ==> execute as @e run function <block_id>
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

