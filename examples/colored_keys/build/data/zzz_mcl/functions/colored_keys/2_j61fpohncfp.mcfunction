data modify storage zzz_mcl:colored_keys stack append value [B;]
execute if entity @a[distance=..2,nbt={Inventory:[{tag:{Tags:["--colored_keys-is_key"]}}]}] run data modify storage zzz_mcl:colored_keys stack[-1] append value 1b
execute if data storage zzz_mcl:colored_keys stack[-1][0] run execute positioned ~ ~-1 ~ run setblock ~ ~ ~ minecraft:redstone_block
execute unless data storage zzz_mcl:colored_keys stack[-1][0] run execute positioned ~ ~-1 ~ run setblock ~ ~ ~ minecraft:glass
data remove storage zzz_mcl:colored_keys stack[-1]