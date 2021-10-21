# var $flag = true
scoreboard players set --use_thrown-find_owner-flag --use_thrown--vars 1
# var $found = false
scoreboard players set --use_thrown-find_owner-found --use_thrown--vars 0
# for (@player[distance<30]) {
#     unless ($found) {
#       @s::Finder = @s::Owner
#       $flag ?= @s::Finder = @p::UUID
#       unless ($flag) {
#         $found = true
#         then()
#       }
#     }
#   }
execute as @e[type=minecraft:player,distance=..29.999999] at @s run execute if score --use_thrown-find_owner-found --use_thrown--vars matches 0 run function zzz_mcl:use_thrown/9_qzaltxfk4xa
# unless ($found) else()
execute if score --use_thrown-find_owner-found --use_thrown--vars matches 0 run say no owner found