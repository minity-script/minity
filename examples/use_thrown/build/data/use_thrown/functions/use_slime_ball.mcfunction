# var $flag = true
scoreboard players set --use_thrown-use_slime_ball-flag --use_thrown--vars 1
# if (@s{Item:{tag:{ "{.special_slime_ball}":true }} }) {
#     when find_owner then {
#       say I dropped it
#       anchored eyes when find_block then {
#         repeat up 1 until air then setblock slime_block
#       } catch {
#         say nothing found close enough
#       } 
#     } catch {
#       say no owner found
#     }
#   }
execute if entity @s[nbt={Item:{tag:{"--use_thrown-special_slime_ball":1b}}}] run function zzz_minity:use_thrown/find_owner_xr770x9s4yq