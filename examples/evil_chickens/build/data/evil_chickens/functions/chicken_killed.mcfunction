# for @endermite.evil {
#     as @s{OnGround:1b} /kill @s
#     unless @chicken.evil[distance<0.5] /kill @s
#   }
execute as @e[type=minecraft:endermite,tag=--evil_chickens-evil] at @s run function zzz_mcl:evil_chickens/13_gn4e56r7cgw
# $chickens --
scoreboard players remove --evil_chickens-chickens --evil_chickens--vars 1
# bossbar chickens value = $chickens
execute store result bossbar evil_chickens:chickens value run scoreboard players get --evil_chickens-chickens --evil_chickens--vars
# if ($chickens < 1 ) {
#     victory()
#   }
execute if score --evil_chickens-chickens --evil_chickens--vars matches ..0 run function evil_chickens:victory