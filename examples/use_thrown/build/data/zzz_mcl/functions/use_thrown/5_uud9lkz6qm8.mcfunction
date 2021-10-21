data modify storage zzz_mcl:use_thrown stack append value [B;]
execute if score --use_thrown-raycast-count --use_thrown--vars matches ..19 run data modify storage zzz_mcl:use_thrown stack[-1] append value 1b
execute if data storage zzz_mcl:use_thrown stack[-1][0] run function zzz_mcl:use_thrown/3_iyza6ogks5
execute unless data storage zzz_mcl:use_thrown stack[-1][0] run say nothing found close enough
data remove storage zzz_mcl:use_thrown stack[-1]