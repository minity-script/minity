data modify entity @s Finder set from entity @s Owner
execute store result score --use_thrown-use_cake-flag --use_thrown--vars run data modify entity @s Finder set from entity @p UUID
execute if score --use_thrown-use_cake-flag --use_thrown--vars matches 0 run say I dropped it
execute anchored eyes run function zzz_mcl:use_thrown/raycast_duilofnd6ku