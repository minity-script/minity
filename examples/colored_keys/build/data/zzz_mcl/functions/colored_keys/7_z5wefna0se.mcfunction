data modify storage zzz_mcl:colored_keys stack append value [B;]
execute unless block ~ ~ ~ minecraft:air run data modify storage zzz_mcl:colored_keys stack[-1] append value 1b
execute if data storage zzz_mcl:colored_keys stack[-1][0] run function zzz_mcl:colored_keys/3_x6r86zs2ry
execute unless data storage zzz_mcl:colored_keys stack[-1][0] run function zzz_mcl:colored_keys/6_70284jv8vnl
data remove storage zzz_mcl:colored_keys stack[-1]