# as @player.playing {
#     /title @s title {=<t>Defeat!</t>}
#     /title @s subtitle {=<t>Evil chickens got the best of you.</t>}
#   }
execute as @e[type=minecraft:player,tag=--evil_chickens-playing] run function zzz_mcl:evil_chickens/582_sm5n4fkf51o
# stop()
function evil_chickens:stop