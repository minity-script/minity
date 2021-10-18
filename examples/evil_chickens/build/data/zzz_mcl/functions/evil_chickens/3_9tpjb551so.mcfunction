function zzz_mcl:evil_chickens/2_62ogwvp5vdv
scoreboard players remove --evil_chickens-start-count --evil_chickens--vars 1
tellraw @s [{"score":{"name":"--evil_chickens-start-count","objective":"--evil_chickens--vars"}}]
execute if score --evil_chickens-start-count --evil_chickens--vars matches 1.. run function zzz_mcl:evil_chickens/3_9tpjb551so