# for @player.playing begin()
execute as @e[type=minecraft:player,tag=--evil_chickens-playing] at @s run function evil_chickens:begin
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
# every 2t {
#     if(@player.playing[->death>0]) defeat()
#   } while $running
function zzz_mcl:evil_chickens/9_3a48xwmdfoi
# var $count = 0
scoreboard players set --evil_chickens-start_game-count --evil_chickens--vars 0
# every 3s {
#     at any @player.playing summon_chicken()
#     $count ++
#   } while $running and while $count<?init_chickens then every 10s {
#     at any @player.playing back 10 {
#       summon_chicken()
#     }
#     $count ++
#   } while $running and while $count<?max_chickens
function zzz_mcl:evil_chickens/10_5kyey9cflya
# tag lunging
# every 4s {
#     say still running
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
#     as @e[type=?passenger].evil {
#       @s::Lifetime = 0
#     }
#     for @chicken.evil unless (@player.playing[distance<20]) {
#       up 1 facing furthest @player.playing forward 10 {
#         if (air) /tp @s ~ ~ ~ facing entity {furthest @player.playing} eyes
#       } 
#       
#       at furthest @player.playing[distance>50] {
#         /tp ~ 10 ~
#       }
#     }
#   } while ($running)
function zzz_mcl:evil_chickens/17_y3ci5rnzj7
# every 1s {
#     $time -- 
#     bossbar timer value = $time
#     if ($time < ?blink_time ) {
#       bossbar timer visible = true
#       for @player.playing {
#         /playsound minecraft:entity.arrow.hit_player player {@s}
#       }
#       after 0.5s {
#         bossbar timer visible = false
#       }
#     }
#     if ($time<1) and if ($running>0) out_of_time()
#   } while ($running)
function zzz_mcl:evil_chickens/20_vmj95ux79b