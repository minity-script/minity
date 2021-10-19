# as @player[distance<10] begin()
execute as @e[type=minecraft:player,distance=..9.999999] run function evil_chickens:begin
# $chickens = 0
scoreboard players set --evil_chickens-chickens --evil_chickens--vars 0
# bossbar chickens players = @a.playing
bossbar set evil_chickens:chickens players @a[tag=--evil_chickens-playing]
# bossbar chickens visible = true
bossbar set evil_chickens:chickens visible true
# bossbar chickens max = ?max_chickens
bossbar set evil_chickens:chickens max 40
# bossbar chickens value = $chickens
execute store result bossbar evil_chickens:chickens value run scoreboard players get --evil_chickens-chickens --evil_chickens--vars
# $time = ?max_time
scoreboard players set --evil_chickens-time --evil_chickens--vars 120
# bossbar timer players = @a.playing
bossbar set evil_chickens:timer players @a[tag=--evil_chickens-playing]
# bossbar timer visible = true
bossbar set evil_chickens:timer visible true
# bossbar timer max = ?max_time
bossbar set evil_chickens:timer max 120
# bossbar timer value = ?max_time
bossbar set evil_chickens:timer value 120
# $running = 1
scoreboard players set --evil_chickens-running --evil_chickens--vars 1
# var $count = 0
scoreboard players set --evil_chickens-start-count --evil_chickens--vars 0
# repeat {
#     at any @player.playing summon_chicken()
#     $count ++
#     print {$count}
#   } while ($count < ?init_chickens)
function zzz_mcl:evil_chickens/569_p69jwpsqskj
# every 10s {
#     at any @player.playing back 10 {
#       summon_chicken()
#     }
#   } while $running > 0 and while $count<?max_chickens
function zzz_mcl:evil_chickens/570_jfukiqmlxpk
# tag lunging
# every 4s {
#     as (random 1 @chicken.evil{OnGround:1b}) {
#       @s::Motion[1] = 1d
#       tag @s lunging
#       after 4t {
#         for @e.lunging {
#           facing nearest @player.playing[distance>10] forward 10 {
#             if (air) /tp ~ ~ ~
#           }
#           untag @s lunging
#         }
#       }
#     }
#     as @endermite.evil {
#       @s::Lifetime = 0
#     }
#     for @chicken.evil unless (@player.playing[distance<20]) {
#       up 1 facing nearest @player.playing forward 10 {
#         if (air) /tp @s ~ ~ ~ facing entity {nearest @player.playing} eyes
#       }
#       at nearest @player.playing[distance>50] {
#         /tp ~ 10 ~
#       }
#     }
#   } while ($running>0)
function zzz_mcl:evil_chickens/575_3zs3vqvpwh7
# every 1s {
#     $time -- 
#     bossbar timer value = $time
#     if ($time<1) and if ($running>0) defeat()
#     if ($time < ?blink_time ) {
#       bossbar timer visible = true
#       for @player.playing {
#         /playsound minecraft:entity.arrow.hit_player player {@s}
#       }
#       after 0.5s {
#         bossbar timer visible = false
#       }
#     }
#   } while ($running>0)
function zzz_mcl:evil_chickens/578_vw8tejrb8d