data modify storage mcl:basic stack append value []
execute if data storage basic:mcl_vars flip run data modify storage mcl:basic stack[-1] append value 1b
execute if data storage mcl:basic stack[-1][0] run function mcl:basic/f_7rkey85a5nd
execute unless data storage mcl:basic stack[-1][0] run function mcl:basic/f_0hozfsn9dx38
data remove storage mcl:basic stack[-1]