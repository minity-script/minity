execute as @e[type=minecraft:chicken,sort=random,limit=1,tag=--evil_chickens-evil,nbt={OnGround:1b}] run function zzz_mcl:evil_chickens/573_ap85wtasnln
execute as @e[type=minecraft:endermite,tag=--evil_chickens-evil] run data modify entity @s Lifetime set value 0
execute as @e[type=minecraft:chicken,tag=--evil_chickens-evil] at @s run execute unless entity @e[type=minecraft:player,tag=--evil_chickens-playing,distance=..19.999999] run function zzz_mcl:evil_chickens/574_r6r2cv2qkc
execute if score --evil_chickens-running --evil_chickens--vars matches 1.. run schedule function zzz_mcl:evil_chickens/575_3zs3vqvpwh7 4s