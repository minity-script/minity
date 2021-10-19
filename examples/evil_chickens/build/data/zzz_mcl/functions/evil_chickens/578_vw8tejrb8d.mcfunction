scoreboard players remove --evil_chickens-time --evil_chickens--vars 1
execute store result bossbar evil_chickens:timer value run scoreboard players get --evil_chickens-time --evil_chickens--vars
execute if score --evil_chickens-time --evil_chickens--vars matches ..0 if score --evil_chickens-running --evil_chickens--vars matches 1.. run function evil_chickens:defeat
execute if score --evil_chickens-time --evil_chickens--vars matches ..19 run function zzz_mcl:evil_chickens/577_o1s8rc1d1ci
execute if score --evil_chickens-running --evil_chickens--vars matches 1.. run schedule function zzz_mcl:evil_chickens/578_vw8tejrb8d 1s