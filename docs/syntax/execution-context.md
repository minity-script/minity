

# Execution context

All Minecraft commands run in an *execution context*. This includes the current entity (referred to as `@s` in code), the current position and rotation (these are origins for relative and local coordinates), and the current dimension.

Execution context modifiers are constructs that modify the context for the following statement or a block of statements. You can use all native Minecraft context modifiers (`as`, `at`, ...) Some additional shorthand modifiers are provided by maclang.

See also [Conditional Execution](flow-control#if) for an upgraded version of Minecraft's native `if`/`unless`.

## Native context modifiers

### **as** <small>[construct](defs#construct)</small>
<def>**as** [*selector*](selector) [*statement*](defs#statement)</def>

Selects the matching items, and runs the following statement(s) for each of them, setting the current entity (`@s`) to each matching entity in turn. 
````minity
as @e[distance=...3] { 
  tag @s is_near
}
````

### **at** <small>[construct](defs#construct)</small>
<def>**at** [*selector*](selector) [*statement*](defs#statement)</def>

Selects the matching items, and runs the following statement(s) at each of their positions and rotations in turn, without changing the current entity. 
````minity
at @player { 
  down 1 setblock lava
}
````
### **anchored** <small>[construct](defs#construct)</small>
<def>**anchored** **eyes** [*statement*](defs#statement)
**anchored** **feet** [*statement*](defs#statement)</def>

Changes the current execution position and rotation to match that of the current item's eyes or feet.

### **positioned** <small>[construct](defs#construct)</small>
<def>**positioned** [*position*](args#position) [*statement*](defs#statement)</def>

Changes the current execution position, thus changing the meaning of relative coordinates in the following statement(s):
````minity
positioned 0 0 0 { 
  // ~ ~ ~ is now at world origin
}
positioned ~ ~3 ~ { 
  // ~ ~ ~ is now three blocks above
}
````
You will probably use this only for absolute coordinates, because minity provides a more convenient way to change position with coordinate modifiers.

### **positioned as** <small>[construct](defs#construct)</small>
<def>**positioned as** [*selector*](selector) [*statement*](defs#statement)</def>

Changes the current execution position, thus changing the meaning of relative coordinates in the following statement(s):
````minity
positioned as @player ...
````

### **align** <small>[construct](defs#construct)</small>

<def>**align** *axes*</def>

Rounds down the current coordinates in the chosen axes. Note that you must specify the axes in the correct order, unlike in `.mcfunction`


````minity
align xyz ...   // align in all three axes
align xz ...    // align in horizontal axes
align xzy ...   // error, you must sort the axes corretly
````

### **rotated** <small>[construct](defs#construct)</small>
<def>**rotated** *[*rotation*](args#rotation)* [*statement*](defs#statement)</def>


Changes the current execution position, thus changing the meaning of local coordinates in the following statement(s):
````minity
rotated 0 0 { 
  // looking straight north
}
rotated ~ ~30 { 
  // rotate 30 degrees upwards
}
````
You will probably use this only for absolute rotation, because minity provides a more convenient way to change rotation with coordinate modifiers.

### **rotated as** <small>[construct](defs#construct)</small>
<def>**rotated as** [*selector*](selector) [*statement*](defs#statement)</def>

Changes the current execution rotation, thus changing the meaning of local coordinates in the following statement(s):
````minity
rotated as @player ...
````


## Universal modifier
### **for** <small>[construct](defs#construct)</small>
<def>**for** [*selector*](selector) [*statement*](defs#statement)</def>

Shorthand for setting the execution entity, position, rotation and dimension at the same time. 
````minity
for @e[distance=...3] { ... }

// is the same as  ...

as @e[distance=...3] at @s { ... }
````

## Relative position modifiers

![world axes](../world-axes.png ':class=float-right')

Minity provides shorthands for moving the current position along the world coordinate axes. Consecutive relative position modifiers will be consolidated into a single `positioned` subcommand during compilation:


````minity
down 1 north 3 up 2 .... 
==> /execute positioned ~ ~1 ~-3 run ...
````


### **up** / **down** <small>[construct](defs#construct)</small>  
<def>**up** [*float*](values#float) [*statement*](defs#statement)
**down** [*float*](values#float) [*statement*](defs#statement)</def>

Shorthands for moving the current position along the world Y axis.

````minity
at @player {
  down 1 {
    setblock redstone_block 
  }
}
````


### **north** / **south** <small>[construct](defs#construct)</small>
<def>**north** [*float*](values#float) [*statement*](defs#statement)
**south** [*float*](values#float) [*statement*](defs#statement)</def>

Shorthands for moving the current position along the world X axis.

### **west** / **east** <small>[construct](defs#construct)</small>
<def>**west** [*float*](values#float) [*statement*](defs#statement)
**east** [*float*](values#float) [*statement*](defs#statement)</def>

Shorthands for moving the current position along the world Z axis.


## Local position modifiers

![world axes](../entity-axes.png ':class=float-right')

Minity provides shorthands for moving the current position along the entity coordinate axes. Consecutive local position modifiers will be consolidated into a single `positioned` subcommand during compilation:


````minity
left 2 forward 3 right 1 .... 
==> /execute positioned ^1 ^ ^3 run ...

````
### **upward** / **downward** <small>[construct](defs#construct)</small> 
<def>**upward** [*float*](values#float) [*statement*](defs#statement)
**downward** [*float*](values#float) [*statement*](defs#statement)</def>

Shorthands for moving the current position along the Y axis of the current entity's local coordinate system. 


### **forward** / **back** <small>[construct](defs#construct)</small>
<def>**forward** [*float*](values#float) [*statement*](defs#statement)
**back** [*float*](values#float) [*statement*](defs#statement)</def>

Shorthands for moving the current position along the Z axis of the current entity's local coordinate system.

### **left** / **right** <small>[construct](defs#construct)</small>
<def>**left** [*float*](values#float) [*statement*](defs#statement)
**right** [*float*](values#float) [*statement*](defs#statement)</def>

Shorthands for moving the current position along the X axis of the current entity's local coordinate system.

## Relative rotation modifiers
### **up** / **down**  <small>[construct](defs#construct)</small>
<def>**up** [*angle*](args#angle) [*statement*](defs#statement)
**down** [*angle*](args#angle) [*statement*](defs#statement)</def>

Shorthands for changing the current Y rotation.


### **left** / **right** <small>[construct](defs#construct)</small>
<def>**left** [*angle*](args#angle) [*statement*](defs#statement)
**right** [*angle*](args#angle) [*statement*](defs#statement)</def>

Shorthands for changing the current X rotation.
