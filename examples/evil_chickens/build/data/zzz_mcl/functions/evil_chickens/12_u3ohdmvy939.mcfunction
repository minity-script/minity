execute at @e[type=minecraft:player,sort=random,limit=1,tag=--evil_chickens-playing] run function evil_chickens:summon_chicken
scoreboard players add --evil_chickens-start_game-count --evil_chickens--vars 1
data modify storage zzz_mcl:evil_chickens stack append value [B;]
execute unless score --evil_chickens-running --evil_chickens--vars matches 0 if score --evil_chickens-start_game-count --evil_chickens--vars matches ..5 run data modify storage zzz_mcl:evil_chickens stack[-1] append value 1b
execute if data storage zzz_mcl:evil_chickens stack[-1][0] run schedule function zzz_mcl:evil_chickens/10_5kyey9cflya 3s
execute unless data storage zzz_mcl:evil_chickens stack[-1][0] run function zzz_mcl:evil_chickens/11_cwbu7fpcp3e
data remove storage zzz_mcl:evil_chickens stack[-1]