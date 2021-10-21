data modify storage zzz_mcl:use_thrown stack append value [B;]
execute unless block ~ ~ ~ minecraft:air run data modify storage zzz_mcl:use_thrown stack[-1] append value 1b
execute if data storage zzz_mcl:use_thrown stack[-1][0] run function zzz_mcl:use_thrown/3_iyza6ogks5
execute unless data storage zzz_mcl:use_thrown stack[-1][0] run setblock ~ ~ ~ minecraft:slime_block
data remove storage zzz_mcl:use_thrown stack[-1]