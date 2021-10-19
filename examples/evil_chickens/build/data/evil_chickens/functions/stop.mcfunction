# $running = 0
scoreboard players set --evil_chickens-running --evil_chickens--vars 0
# as @chicken.evil {
#     @s::Motion[1] = 1d
#     @s::Motion[1] = 1d
#   }
execute as @e[type=minecraft:chicken,tag=--evil_chickens-evil] run function zzz_mcl:evil_chickens/14_vk54y32gfs
# /effect clear {@player.playing} minecraft:blindness
effect clear @e[type=minecraft:player,tag=--evil_chickens-playing] minecraft:blindness
# /kill {@e.evil}
kill @e[tag=--evil_chickens-evil]
# bossbar chickens visible = false
bossbar set evil_chickens:chickens visible false
# bossbar timer visible = false
bossbar set evil_chickens:timer visible false