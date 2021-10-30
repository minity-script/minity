Minity has a small but growing set of commands that wrap the functionality of native Minecraft commands. Some are just simple wrappers, others provide nicer syntax and/or additional functionalities. 

Any new commands will be documented here when they are added. 

If the comamnd you need is not provided by Minity yet, you can [use native minecraft commands](#using-native-minecraft-commands), possibly with [argument interpolation](#argument-interpolation).

It is the goal of Minity to cover most, but not all Minecraft commands. Some are not usable in functions. Others may be low-priority because they have convoluted syntax, and implementing wrappers for them will be a challenge, and may not provide much help to the programmer apart from removing the slash at the beginning of the line.

Note that the functionality of `execute`, `scoreboard` and `data` commands is suported with other Minity constructs and they are not intended on purpose.

!> Minity doesn't allow functions and macros to have the same names as Minity keywords. To future-proof your programs, avoid naming your functions and macros the same as any native minecraft command or any of its major subcommands, beacuse these couled eventually be used as keywords by Minity.


### **append**
<code>**append** *NBTpath* *value*</code>
Append a value to a list at a NBTpath. The value can be anything that can be assigned to a NBT path. See [Working with NBT data](#working-with-nbt-data).

### **bossbar**
<code>**bossbar add** *id* *name*</code>

Add a bossbar. Works exactly like in Minecraft. The namespace of the id defaults to the current namespace. See also [Bossbars](#bossbars).

<code>**bossbar remove** *id* </code>

Remove a bossbar. Works exactly like in Minecraft. The namespace of the id defaults to the current namespace. See also [Bossbars](#bossbars).

### **clear**
<code>**clear** *target*? *count*? *item_id*{*NBT_compound*}? </code>

Remove items from an entity's or entities' inventory. Works just like in .mcfunction, but with a slightly more readable order of arguments. 

Target defaults to `@s`, count defaults to 1.
````minity
clear 3 diamond{          // no space allowed between item id and NBT, 
  tag:{ special:true }    // just like in minecraft, but you can break your 
}                         // long values over several lines
````
###  **give**
<code>**give** [*target*] [*count*] *item_id*[*NBT_compound*] </code>

Give items to an entity or entities. Works just like in .mcfunction, but with a slightly more readable order of arguments. 

Target defaults to `@s`, count defaults to 1.
````minity
give 3 diamond{          // no space allowed between item id and NBT, 
  tag:{ special:true }    // just like in minecraft, but you can break your 
}                         // long values over several lines
````
### **merge**
<code>**merge** *NBTpath* *value*</code>

Merge a value with the value of NBTpath. The value can be a compound, a list of another NBTpath. See [Working with NBT data](#working-with-nbt-data).

### **prepend**
<code>**prepend** *NBTpath* *value*</code>

Prepend a value to a list at a NBTpath. The value can be anything that can be assigned to a NBT path. See [Working with NBT data](#working-with-nbt-data).

### **print**

<code>**print** *target*? *raw_text*</code>

A wrapper for tellraw. The text will be parsed as if it is *already within* a `<span>` tag, which means that you can use raw tag markup in the text, but don't have to wrap it in a tag:
````minity
print This is a <b>very</b> important message. There is {$time_left} time left.
````
This is a *greedy command*, so it will print all the characters until the end of the line. Target defaults to the current entity. 

### **say**
<code>**say** *text*</code>

A trivial wrapper for the native `/say` command. 
````minity
say Hello!
````
This is a *greedy command*, so it will print all the characters until the end of the line. 
<blockquote>
This should maybe allow raw text as well, and behave the same as `print @a`
</blockquote>

### **setblock**
<code>**setblock** *position*? *block_id*[*block states*]{*NBT_compound*}</code><br>

Set a block.

Position defaults to the current position.
````minity
setblock air                        // is the block at the current position air
setblock ~ ~2 ~ air                 // you can use coordinates
setblock up 2 air                   // or directions
setblock torch[facing=north]        // block states 
setblock chest{Items:[...]}         // block NBT values
````
### **summon**

<code>**summon** *position*? *entity_type*[*NBT_compound*]</code><br>
<code>**summon** *position*? *entity_type*[*NBT_compound*] **then** *statement*</code><br>

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
### **tag**
<code>**tag** *selector* *tag*</code>

Add a namespaced tag to the selected entities. 
````minity
tag @item[distance<=5] nearby

  ==> tag add @
````
### **untag**
<code>**untag** *selector* *tag*</code>

Remove a namespaced tag from the selected entities. 
````minity
untag @player.processed 
````