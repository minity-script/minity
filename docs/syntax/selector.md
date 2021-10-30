# Advanced target selectors :id=selector
All valid minecraft selectors should work in minity. The only exception are bare player ids, which are instead accepted in the form of `@[player_id]`

In addition, syntactic sugar is provided for some selector conditions. Similar to css, multiple conditions can be applied in series, as long as there is no whitespace betwen them. See below for the conditions that you can apply this way.
````minity
@item.special[distance <= 3]{Invulnerable:1b}

   // ... is the same as 

@e[type=item,tag=special,distance=..3,nbt={Invulnerable:1b}]
````
## Selector head

### <b>@[</b>*player_id*<b>]</b>
A replacement for bare player names or UUIDs used as target selectors in .mcfunction. Cannot be followed by conditions.

````minity
as @[yockz] {...}      => execute as yockz run ...
````

### <b>@p</b> <b>@r</b> <b>@a</b> <b>@s</b> <b>@e</b>
These work exactly the same as in .mcfunction, and will match:
* `@p` the nearest player
* `@r` random player
* `@a` all players, live or not
* `@s` the entity executing the statement
* `@e` all entities

Can be followed by conditions.

### <b>@</b>*type*
Sets the `type` condition of the selector. The type can include a namespace, if not, it defaults to `minecraft`.

````minity
@item         // match all item entities   
              => @e[type=item]

@armor_stand  // match all armor stands
              => @e[type=armor_stand]
````
This will set the *target selector variable* to `@e`, and will match all live entities of the given type. This means that `@player` will match only live players, and you need to use `@a` if you want to target all players. 

Can be followed by conditions.

### <b>@#</b>*entity_type_tag*
Sets the `type` condition of the selector. If namespace is not provided, it defaults to `minecraft`.
````minity
@#raider            // match all raiders                       
                    => @e[type=#minecraft:raider]
@#my_pack:enemies   // match all enemies tagged in a datapack
                    => @e[type=#my_pack:enemies]
````
This will set the *target selector variable* to `@e`. See above. 

Can be followed by conditions.

## Selector conditions

### <b>[</b>*condition* *op* *value*<b>]</b>
Match entities for which the test in the brackets is true. The condition is one of the native target selector conditions. The accepted values and allowed comparison operators depend on the condition.

Allowed for all conditions:
````minity
@e[team = my_team]   // test if condition matches value
@e[team == my_team]  // alias of =, for consistency with minity syntax
                     => @e[team = my_team]
````
Allowed for some conditions, see Minecraft documentation:
````minity
@e[team =! my_team]  // negates the condition, only allowed for some conditions
@e[team != my_team]  // alias of =!, for consistency with minity syntax
                     => @e[team =! my_team]
````
Allowed for conditions that accept ranges:
````minity
@e[distance >= 10 ]     => @e[distance=10..]
@e[distance <= 10 ]     => @e[distance=..10]
@e[level > 10 ]         => @e[level=11..]
@e[level < 10 ]         => @e[level=..9]
````

### <b>.</b>*tag*
Sets the `tag` condition. Can be used multiple times. Uses namespaced tags declared in the current scope.
````minity
@a.newby                // match players with the `newby` tag in the current scope
                        => @e[tag=--my_ns-newby]
@item.special.key       // match items that have both tags
                        => @e[tag=--my_ns-special,tag=--mcl-my_ns-key]
if @s.special { ... }   // run statements if the current entity is special
                        => execute if @s[tag=--mcl-my_ns-special] run ...
````

### <b>!</b>*tag*
Sets the `tag` condition to exclude the tag. Uses namespaced tags declared in the current scope.
````minity
@e!special            // match items that are not tagged `special`
                      => @e[tag=!--my_ns-special]

@e.special!processed  // match items that are special but not yet processed
                      => @e[tag=--my_ns-special,tag=!--my_ns-my_func_processed]
````
### <b>{</b>*NBT_data*<b>}</b>
Sets the `nbt` condition to the provided data. Can be used multiple times.

````minity
@e{Invulnerable:1b}    // match all invulnerable items
                       => @e[nbt={Invulnerable:1b}]
````
### <b>[-></b>*score_name* *op* *integer*<b>]</b>
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

## Sorting and limit
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