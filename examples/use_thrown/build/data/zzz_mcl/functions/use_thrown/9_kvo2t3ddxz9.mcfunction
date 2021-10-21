scoreboard players add --use_thrown-use_thrown/raycast_duilofnd6ku-count --use_thrown--vars 1
data modify storage zzz_mcl:use_thrown stack append value [B;]
execute if score --use_thrown-use_thrown/raycast_duilofnd6ku-count --use_thrown--vars matches ..19 if block ~ ~ ~ minecraft:air run data modify storage zzz_mcl:use_thrown stack[-1] append value 1b
execute if data storage zzz_mcl:use_thrown stack[-1][0] run function zzz_mcl:use_thrown/7_3amy3bp5asj
execute unless data storage zzz_mcl:use_thrown stack[-1][0] run function zzz_mcl:use_thrown/8_vh421b6328
data remove storage zzz_mcl:use_thrown stack[-1]