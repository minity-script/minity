# tag processed
# for @item{Item:{tag:{"{.undroppable}":true}}}!processed {
#     /effect give @s minecraft:invisibility 1 1 true
#     @s::Silent = true
#     @s::Owner = @s::Thrower
#     @s::PickupDelay = 0
#     tag @s processed
#     #dropped()
#   }
execute as @e[type=minecraft:item,nbt={Item:{tag:{"--use_thrown-undroppable":1b}}},tag=!--use_thrown-keep_stuff-processed] at @s run function zzz_minity:use_thrown/1_coz5gy8htgq