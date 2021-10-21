# for @s.?is_lock {
#     up ?delta if (@a[distance = ..2]{
#       Inventory:[{
#         tag:{Tags:["{.is_key}"]}
#       }]
#     }) {
#       down ?delta setblock redstone_block
#     }  else {
#        down ?delta setblock glass
#     } 
#   }
execute as @s[tag=--colored_keys-is_red_lock] at @s run execute positioned ~ ~1 ~ run function zzz_mcl:colored_keys/28_47ve5rulw36