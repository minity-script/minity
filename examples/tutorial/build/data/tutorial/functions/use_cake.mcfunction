# var $flag = true
scoreboard players set --tutorial-use_cake-flag --tutorial--vars 1
# if (@s{Item:{tag:{ "{.special_cake}":true }} }) {
#     for (@player[distance<30]) {
#       @s::Finder = @s::Owner
#       $flag = @s::Finder = @p::UUID
#       unless ($flag) {
#         /say I dropped it
#       }
#       anchored eyes with raycast(20) {
#         up 1 if air setblock redstone_block
#       } else {
#         say not found
#       }
#     }   
#   }
execute if entity @s[nbt={Item:{tag:{"--tutorial-special_cake":1b}}}] run execute as @e[type=minecraft:player,distance=..29.999999] at @s run function zzz_mcl:tutorial/5_5sv34og6srl