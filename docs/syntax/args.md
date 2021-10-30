## Position

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
## Rotation

The same works for rotations, though you are even less likely to need to specify a rotation:
````minity
  setblock (forward 1) stone
    ==> setblock ^ ^ ^1 stone
  
  forward 1 setblock stone
    ==> execute positioned ^ ^ ^1 run setblock ~ ~ ~ stone
````

## Angle
A [float](values#float) literal followed by `deg`, with no whitespace allowed:
````minity
120deg
22.5deg
````

## Block specification

## Item specification

## Entity specification

## Statement
A Minity statement, a native command, or a block of statements in `{}` braces.