data modify entity @s Finder set from entity @s Owner
execute store success score --use_thrown-find_owner-flag --use_thrown--vars run data modify entity @s Finder set from entity @p UUID
execute if score --use_thrown-find_owner-flag --use_thrown--vars matches 0 run function zzz_mcl:use_thrown/8_t2zvjn1ufk