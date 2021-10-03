data modify storage mcl:basic stack append value []
execute unless entity @s[tag=welcomed] run data modify storage mcl:basic stack[-1] append value 1b
execute if data storage mcl:basic stack[-1][0] run function mcl:basic/f_y849f1j7t7
execute unless data storage mcl:basic stack[-1][0] run say hello old friend
data remove storage mcl:basic stack[-1]