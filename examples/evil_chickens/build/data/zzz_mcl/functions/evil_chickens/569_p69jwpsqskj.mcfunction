execute at @e[type=minecraft:player,sort=random,limit=1,tag=--evil_chickens-playing] run function evil_chickens:summon_chicken
scoreboard players add --evil_chickens-start-count --evil_chickens--vars 1
tellraw @s [{"score":{"objective":"--evil_chickens--vars","name":"--evil_chickens-start-count"}}]
execute if score --evil_chickens-start-count --evil_chickens--vars matches ..9 run function zzz_mcl:evil_chickens/569_p69jwpsqskj