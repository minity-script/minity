data modify storage mcl:basic stack append value []
execute if data storage basic:mcl_vars flip run data modify storage mcl:basic stack[-1] append value 1b
execute if data storage mcl:basic stack[-1][0] run function mcl:basic/f_3un52ai68z3
execute unless data storage mcl:basic stack[-1][0] run function mcl:basic/f_sesyvobmzkl
data remove storage mcl:basic stack[-1]