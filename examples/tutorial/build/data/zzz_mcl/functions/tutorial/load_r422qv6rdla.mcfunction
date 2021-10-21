say Hello World
say Tutorial loaded
scoreboard players set --tutorial-enabled --tutorial--vars 1
# function tutorial:greet
give @a minecraft:cake{CustomName:'{"bold":true,"text":"","extra":["Special cake"]}',"--tutorial-undroppable":1b,"--tutorial-special_cake":1b}
# function tutorial:foo/keep_stuff
# function tutorial:use_cake