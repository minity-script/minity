data modify storage zzz_mcl:colored_keys stack append value [B;]
execute unless block ~ ~ ~ minecraft:air run data modify storage zzz_mcl:colored_keys stack[-1] append value 1b
execute if data storage zzz_mcl:colored_keys stack[-1][0] run function zzz_mcl:colored_keys/1_cjgxph3ml89
execute unless data storage zzz_mcl:colored_keys stack[-1][0] run function zzz_mcl:colored_keys/4_z6ebpjruci
data remove storage zzz_mcl:colored_keys stack[-1]