data modify storage zzz_mcl:tutorial stack append value [B;]
execute if score --tutorial-tutorial/raycast_sqw6wymlq3m-count --tutorial--vars matches ..19 run data modify storage zzz_mcl:tutorial stack[-1] append value 1b
execute if data storage zzz_mcl:tutorial stack[-1][0] run execute positioned ~ ~1 ~ run execute if block ~ ~ ~ minecraft:air run setblock ~ ~ ~ minecraft:redstone_block
execute unless data storage zzz_mcl:tutorial stack[-1][0] run say not found
data remove storage zzz_mcl:tutorial stack[-1]