# tag @player[distance<10] playing
tag @e[type=minecraft:player,distance=..9.999999] add --evil_chickens-playing
# after 1s {
#     for @player.playing {
#       / playsound minecraft:entity.lightning_bolt.thunder player {@s}
#       / effect give {@s} minecraft:blindness 1 1 false
#     }
#   } then after 3s {
#     for @player.playing {
#       / playsound minecraft:entity.lightning_bolt.thunder player {@s}
#       / effect give {@s} minecraft:blindness 1 1 false
#     }
#   } then after 2s {
#     / title {@player.playing} title {=<t>The Chickens are Coming!</t>}
#     / title {@player.playing} subtitle {=<t>You have {?max_time} seconds</t>}
#   } then after 4s {
#     for @player.playing {
#       / playsound minecraft:entity.lightning_bolt.thunder player {@s}
#       / playsound minecraft:entity.lightning_bolt.thunder player {@s}
#       / effect give {@s} minecraft:blindness {?max_time} 120 true
#     }
#   } then after 1s start_game()
schedule function zzz_mcl:evil_chickens/8_8656ws9nzcj 1s