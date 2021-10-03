data modify storage mcl:basic stack append value []
execute if score #mcl.basic.test1.bar mcl.basic > #mcl#30 mcl.mcl run data modify storage mcl:basic stack[-1] append value 1b
execute if data storage mcl:basic stack[-1][0] run function mcl:basic/f_m7c42yamsgs
execute unless data storage mcl:basic stack[-1][0] run tellraw @s [{"score":{"name":"#mcl.basic.test1.bar","objective":"mcl.basic"}},{"text":" "},{"text":"<= 30"}]
data remove storage mcl:basic stack[-1]