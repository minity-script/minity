# if ($running>0) {
#     up 30 summon chicken{
#       DeathLootTable:"minecraft:empty",
#       Glowing: true,
#       Attributes: [{Base:0.35d, Name:"minecraft:generic.movement_speed"}],
#       Passengers:[{
#         DeathLootTable:"minecraft:empty",
#         id:"minecraft:endermite",
#         Tags:["{.evil}"],
#         Invulnerable: true,
#         Silent: true,
#       }],
#     } then {
#       $chickens ++
#       bossbar chickens value = $chickens  
#       /effect give {@s} minecraft:resistance {?max_time} 2 true
#       /effect give {@endermite.evil} minecraft:invisibility {?max_time} 120 true
#       tag @s evil
#       /spreadplayers ~ ~ 5 20 false {@s}
#     }
#   }
execute if score --evil_chickens-running --evil_chickens--vars matches 1.. run execute positioned ~ ~30 ~ run function zzz_mcl:evil_chickens/568_mcazhhy3s7