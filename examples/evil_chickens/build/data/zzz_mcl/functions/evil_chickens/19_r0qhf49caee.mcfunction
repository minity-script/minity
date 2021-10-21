bossbar set evil_chickens:timer visible true
execute as @e[type=minecraft:player,tag=--evil_chickens-playing] at @s run playsound minecraft:entity.arrow.hit_player player @s
schedule function zzz_mcl:evil_chickens/18_jl9g58k8gw 0.5s