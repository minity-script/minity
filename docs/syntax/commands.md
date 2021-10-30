Minity has a small but growing set of commands that wrap the functionality of native Minecraft commands. Some are just simple wrappers, others provide nicer syntax and/or additional functionalities. 

Any new commands will be documented here when they are added. 

If the comamnd you need is not provided by Minity yet, you can [use native minecraft commands](#using-native-minecraft-commands), possibly with [argument interpolation](#argument-interpolation).

It is the goal of Minity to cover most, but not all Minecraft commands. Some are not usable in functions. Others may be low-priority because they have convoluted syntax, and implementing wrappers for them will be a challenge, and may not provide much help to the programmer apart from removing the slash at the beginning of the line.

Note that the functionality of `execute`, `scoreboard` and `data` commands is suported with other Minity constructs and they are not intended on purpose.

!> Minity doesn't allow functions and macros to have the same names as Minity keywords. To future-proof your programs, avoid naming your functions and macros the same as any native minecraft command or any of its major subcommands, beacuse these couled eventually be used as keywords by Minity.


### **append** <small>[command](defs#command)</small>

See [Working with NBT data](nbt#append).

### **bossbar** <small>[command](defs#command)</small>
<def>**bossbar add** *id* *name*</def>

Add a bossbar. Works exactly like in Minecraft. The namespace of the id defaults to the current namespace. See also [Bossbars](bossbar).

<def>**bossbar remove** *id* </def>

Remove a bossbar. Works exactly like in Minecraft. The namespace of the id defaults to the current namespace. See also [Bossbars](bossbar).

### **clear** <small>[command](defs#command)</small>
<def>**clear** [*target*](selector)? [*count*](args#count)? [*item_spec*](args#item-specification) </code>

Remove items from an entity's or entities' inventory. Works just like in .mcfunction, but with a slightly more readable order of arguments. 

Target defaults to `@s`, count defaults to 1.
````minity
clear 3 diamond{          // no space allowed between item id and NBT, 
  tag:{ special:true }    // just like in minecraft, but you can break your 
}                         // long values over several lines
````
###  **give** <small>[command](defs#command)</small>
<def>**give** [*target*](selector)? [*count*](args#count)? [*item_spec*](args#item-specification) </code>

Give items to an entity or entities. Works just like in .mcfunction, but with a slightly more readable order of arguments. 

Target defaults to `@s`, count defaults to 1.
````minity
give 3 diamond{          // no space allowed between item id and NBT, 
  tag:{ special:true }    // just like in minecraft, but you can break your 
}                         // long values over several lines
````
### **merge** <small>[command](defs#command)</small>

See [Working with NBT data](nbt#merge).

### **prepend** <small>[command](defs#command)</small>

See [Working with NBT data](nbt#prepend).

### **print** <small>[command](defs#command) [greedy](defs#greedy)</small>

<def>**print** [*target*](selector)? [*raw_text*](values#raw-text-markup)</def>

A wrapper for tellraw. The text will be parsed as if it is *already within* a `<span>` tag, which means that you can use raw tag markup in the text, but don't have to wrap it in a tag:
````minity
print This is a <b>very</b> important message. There is {$time_left} time left.
````
This is a *greedy command*, so it will print all the characters until the end of the line. Target defaults to the current entity. 

### **remove** <small>[command](defs#command)</small>
See [Working with NBT data](nbt#prepend).

### **say** <small>[command](defs#command) [greedy](defs#greedy)</small>
<def>**say** *text*</def>

A trivial wrapper for the native `/say` command. 
````minity
say Hello!
````
This is a *greedy command*, so it will print all the characters until the end of the line. 

?> This should maybe allow raw text as well, and behave the same as `print @a`

### **setblock** <small>[command](defs#command)</small>
<def>**setblock** [*position*](args#position)? [*block_spec*](args#block-specification)</def>

Set a block. Position defaults to the current position. Whitespace is not allowed between the block id, block states and block nbt.

````minity
setblock air                        // is the block at the current position air
setblock ~ ~2 ~ air                 // you can use coordinates
setblock up 2 air                   // or directions
setblock torch[facing=north]        // block states 
setblock chest{Items:[...]}         // block NBT values
````
### **summon** <small>[command](defs#command) [construct](defs#construct)</small>

<def>**summon** [*position*](args#position)? [*entity_spec*](args#entity-specification)
**summon** [*position*](args#position)? [*entity_spec*](args#entity-specification) **then** [*statement*](defs#statement)</def>

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
### **tag** <small>[command](defs#command)</small>
<def>**tag** [*selector*](selector) [*tag_name*](args#tag)</def>

Add a namespaced tag to the selected entities. 
````minity
tag @item[distance<=5] nearby
````
### **untag** <small>[command](defs#command)</small>
<def>**untag** [*selector*](selector) [*tag_name*](args#tag)</def>

Remove a namespaced tag from the selected entities. 
````minity
untag @player.processed processed
````