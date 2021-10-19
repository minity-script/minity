# tag @s playing
tag @s add --evil_chickens-playing
# @s->played ++
scoreboard players add @s --evil_chickens-played 1
# @s->chickens_killed = 0
scoreboard players set @s --evil_chickens-chickens_killed 0
# /title @s title {=<t>The Chickens are Coming!</t>}
title @s title {"text":"","extra":["The Chickens are Coming!"]}
# /title @s subtitle {=<t>You have {?max_time} seconds</t>}
title @s subtitle {"text":"","extra":["You have ",120," seconds"]}
# /playsound minecraft:entity.lightning_bolt.thunder ambient @s
playsound minecraft:entity.lightning_bolt.thunder ambient @s
# /effect give {@s} minecraft:blindness {?max_time} 120 true
effect give @s minecraft:blindness 120 120 true