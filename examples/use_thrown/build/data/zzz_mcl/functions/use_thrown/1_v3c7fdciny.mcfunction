effect give @s minecraft:invisibility 1 1 true
data modify entity @s Silent set value 1b
data modify entity @s Owner set from entity @s Thrower
data modify entity @s PickupDelay set value 0
tag @s add --use_thrown-keep_stuff-processed
function #use_thrown:dropped