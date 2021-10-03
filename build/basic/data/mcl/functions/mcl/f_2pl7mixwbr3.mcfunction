scoreboard objectives add mcl.basic dummy
scoreboard players set #mcl.basic.foo mcl.basic 2
say hello world
execute as @a[dx=3] run function basic:test1