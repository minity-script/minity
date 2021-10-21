effect give @s minecraft:invisibility 1 1 true
data modify entity @s Silent set value 1b
data modify entity @s Owner set from entity @s Thrower
data modify entity @s PickupDelay set value 0
tag @s add --tutorial-foo/keep_stuff-processed
function #tutorial:drop/ped