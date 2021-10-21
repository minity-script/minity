# tag processed
# for @item{Item:{tag:{"{.undroppable}":true}}}!processed {
#     /effect give @s minecraft:invisibility 1 1 true
#     @s::Silent = true
#     @s::Owner = @s::Thrower
#     @s::PickupDelay = 0
#     tag @s processed
#     #drop/ped()
#   }
execute as @e[type=minecraft:item,nbt={Item:{tag:{"--tutorial-undroppable":1b}}},tag=!--tutorial-foo/keep_stuff-processed] at @s run function zzz_mcl:tutorial/1_fr3ids54805