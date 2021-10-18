# ?max = 10
# tag @player[distance<10] playing
tag @e[type=minecraft:player,distance=..9.999999] add --evil_chickens-playing
# bossbar chickens players = @a.playing
bossbar set evil_chickens:chickens players @a[tag=--evil_chickens-playing]
# bossbar chickens visible = true
bossbar set evil_chickens:chickens visible true
# bossbar chickens max = ?max
bossbar set evil_chickens:chickens max 10
# var $count = 10
scoreboard players set --evil_chickens-start-count --evil_chickens--vars 10
# repeat {
#     summon chicken{
#       Passengers:[{id:"minecraft:endermite",Tags:["{.evil}"]}],
#       HandItems:[{},{},{},{Count:1,id:"minecraft:golden_helmet"}]
#     } then {
#       tag @s evil
#     }
#     $count --
#     print $count
#   } while ($count>0)
function zzz_mcl:evil_chickens/3_9tpjb551so
# /spreadplayers ~ ~ 5 20 false {@chicken.evil}
spreadplayers ~ ~ 5 20 false @e[type=minecraft:chicken,tag=--evil_chickens-evil]
# $running = 1
scoreboard players set --evil_chickens-running --evil_chickens--vars 1
# every 2s {
#     as (random 1 @chicken.evil{OnGround:1b}) {
#       @s::Motion[1] = 1d
#     }
#   } while ($running>0)
function zzz_mcl:evil_chickens/4_c69iv8s21fi
# every 2t {
#     bossbar chickens value = /execute if entity {@chicken.evil}
#   } while ($running>0)
function zzz_mcl:evil_chickens/5_lsmgex3ci6