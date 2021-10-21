data modify entity @s Finder set from entity @s Owner
execute store result score --tutorial-use_cake-flag --tutorial--vars run data modify entity @s Finder set from entity @p UUID
execute if score --tutorial-use_cake-flag --tutorial--vars matches 0 run say I dropped it
execute anchored eyes run function zzz_mcl:tutorial/raycast_sqw6wymlq3m