# as @player.playing {
#     /title @s title {=<t>Defeat!</t>}
#     /title @s subtitle {=<t>Evil chickens got the best of you.</t>}
#   }
execute as @e[type=minecraft:player,tag=--evil_chickens-playing] run function zzz_mcl:evil_chickens/16_pz39jlk8dl
# stop()
function evil_chickens:stop