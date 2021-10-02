
scoreboard players set #mcl.basic.test1.bar mcl.basic 3
tellraw @s [{"score":{"name":"#mcl.basic.test1.bar","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"3"},{"text":" "},{"score":{"name":"#mcl.basic.foo","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"2"}]
scoreboard players set #mcl.basic.foo mcl.basic 4
tellraw @s [{"score":{"name":"#mcl.basic.test1.bar","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"3"},{"text":" "},{"score":{"name":"#mcl.basic.foo","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"4"}]
scoreboard players operation #mcl.basic.test1.bar mcl.basic = #mcl.basic.foo mcl.basic
tellraw @s [{"score":{"name":"#mcl.basic.test1.bar","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"4"},{"text":" "},{"score":{"name":"#mcl.basic.foo","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"4"}]
scoreboard players operation #mcl.basic.test1.bar mcl.basic *= #mcl#3 mcl.mcl
tellraw @s [{"score":{"name":"#mcl.basic.test1.bar","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"12"},{"text":" "},{"score":{"name":"#mcl.basic.foo","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"4"}]
scoreboard players add #mcl.basic.foo mcl.basic 1
tellraw @s [{"score":{"name":"#mcl.basic.test1.bar","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"12"},{"text":" "},{"score":{"name":"#mcl.basic.foo","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"5"}]
scoreboard players operation #mcl.basic.test1.bar mcl.basic *= #mcl.basic.foo mcl.basic
tellraw @s [{"score":{"name":"#mcl.basic.test1.bar","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"60"},{"text":" "},{"score":{"name":"#mcl.basic.foo","objective":"mcl.basic"}},{"text":" "},{"text":"="},{"text":" "},{"text":"5"}]