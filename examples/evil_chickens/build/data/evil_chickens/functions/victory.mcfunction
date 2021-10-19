# as @player.playing {
#     /title @s title {=<t>Victory!</t>}
#     /title @s subtitle {=<t>Evil chickens are vanquished.</t>}
#   }
execute as @e[type=minecraft:player,tag=--evil_chickens-playing] run function zzz_mcl:evil_chickens/581_4uczdkchf8n
# stop()
function evil_chickens:stop