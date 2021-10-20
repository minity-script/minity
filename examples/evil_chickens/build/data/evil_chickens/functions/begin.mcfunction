# tag @s playing
tag @s add --evil_chickens-playing
# @s->death = 0
scoreboard players set @s --evil_chickens-death 0
# @s->played ++
scoreboard players add @s --evil_chickens-played 1
# @s->chickens_killed = 0
scoreboard players set @s --evil_chickens-chickens_killed 0