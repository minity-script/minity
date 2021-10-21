scoreboard players add --tutorial-tutorial/raycast_sqw6wymlq3m-count --tutorial--vars 1
data modify storage zzz_mcl:tutorial stack append value [B;]
execute if score --tutorial-tutorial/raycast_sqw6wymlq3m-count --tutorial--vars matches ..19 if block ~ ~ ~ minecraft:air run data modify storage zzz_mcl:tutorial stack[-1] append value 1b
execute if data storage zzz_mcl:tutorial stack[-1][0] run function zzz_mcl:tutorial/2_h4rywxnd49a
execute unless data storage zzz_mcl:tutorial stack[-1][0] run function zzz_mcl:tutorial/3_ytqdgutbgmk
data remove storage zzz_mcl:tutorial stack[-1]