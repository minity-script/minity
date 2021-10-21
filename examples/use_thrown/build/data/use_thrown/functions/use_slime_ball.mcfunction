# var $flag = true
scoreboard players set --use_thrown-use_slime_ball-flag --use_thrown--vars 1
# if (@s{Item:{tag:{ "{.special_slime_ball}":true }} }) {
#     with find_owner(30) {
#       say I dropped it
#       anchored eyes with raycast(20) {
#         repeat up 1 until air then setblock slime_block
#       } else {
#         say nothing found close enough
#       }
#     } else {
#       say no owner found
#     }
#   }
execute if entity @s[nbt={Item:{tag:{"--use_thrown-special_slime_ball":1b}}}] run function zzz_mcl:use_thrown/find_owner_7wg9kyanq42