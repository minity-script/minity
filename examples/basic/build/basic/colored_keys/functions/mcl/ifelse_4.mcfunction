data modify storage colored_keys:mcl stack append value []
execute if entity @p[distance=..2,nbt={"Inventory":[{tag:{is_red_key:1b}}]}] run data modify storage colored_keys:mcl stack[-1] append value 1b
execute if data storage colored_keys:mcl stack[-1][0] run execute positioned ~0 ~-1 ~0 run setblock ~ ~ ~ minecraft:red_concrete
execute unless data storage colored_keys:mcl stack[-1][0] run execute positioned ~0 ~-1 ~0 run setblock ~ ~-1 ~ minecraft:redstone_block
data modify remove storage colored_keys:mcl stack[-1]