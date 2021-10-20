scoreboard players add @s --evil_chickens-chickens_killed 1
tellraw @a[tag=--evil_chickens-playing] ["I killed one, that's ",{"score":{"objective":"--evil_chickens-chickens_killed","name":"@s"}}," so far"]
function evil_chickens:chicken_killed
advancement revoke @s only evil_chickens:cat369wlula