# for @e.is_lock {
#     unless air {
#       update_locks(blue)
#       update_locks(red)
#     } else {
#       /say i am dead
#       tag @s is_dead_lock 
#       untag @s is_lock  
#       after 3s {
#         /say reviving
#         for @e.is_dead_lock {
#           untag @s is_dead_lock 
#           tag @s is_lock 
#           setblock glass
#         }        
#       }
#     }
#   }
execute as @e[tag=--colored_keys-is_lock] at @s run function zzz_mcl:colored_keys/5_402ndekvztw
# after 2t {
#     if ( $enabled > 0)  update_all_locks()
#   }
schedule function zzz_mcl:colored_keys/6_sb45b159e7h 2t