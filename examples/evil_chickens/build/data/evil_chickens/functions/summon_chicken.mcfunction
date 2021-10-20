# if ($running) {
#     up 30 summon chicken{
#       DeathLootTable:"minecraft:empty",
#       CustomName: json <red>Evil Chicken</red>,
#       Glowing: true,
#       Attributes: [{Base:0.35d, Name:"minecraft:generic.movement_speed"}],
#       Passengers:[{
#         CustomName: json <green>Evil Chicken</green>,
#         DeathLootTable:"minecraft:empty",
#         id:"minecraft:{?passenger}",
#         Tags:["{.evil}"],
#         Invulnerable: true,
#         Silent: true,
#       }],
#     } then {
#       $chickens ++
#       bossbar chickens value = $chickens  
#       /effect give {@s} minecraft:resistance {?max_time} 2 true
#       /effect give {@e[type=?passenger]} minecraft:invisibility {?max_time} 1 true
#       tag @s evil
#       /spreadplayers ~ ~ 5 30 false {@s}
#     }
#   }
execute unless score --evil_chickens-running --evil_chickens--vars matches 0 run execute positioned ~ ~30 ~ run function zzz_mcl:evil_chickens/25_gsd5fgvaop