* Not implemented for now, use `/<native command>`
  * advancement 
  * attribute 
  * ban
  * ban-ip
  * banlist
  * bossbar
  * defaultgamemode
  * deop
  * difficulty
  * effect
  * enchant
  * experience
  * forceload
  * gamemode
  * gamerule
  * item
  * kill
  * loot
  * me
  * msg
  * op
  * pardon
  * pardon-ip
  * particle
  * playsound
  * publish
  * recipe
  * say
  * setworldspawn
  * schedule
    * partially implemented, see `after`
  * spawnpoint
  * seed
  * spectate
  * spreadplayers
  * team
  * teammsg
  * teleport
  * tell
  * tellraw*
    * partially implemented, see `print`
  * time
  * title
  * trigger
  * weather
  * worldborder
  
* TODO
  * clear
  * clone
  * fill
* WONTFIX
  * datapack
  * debug
  * jfr
  * help
  * kick
  * locate
  * locatebiome
  * perf
  * reload
  * save-all
  * save-off
  * save-on
  * setidletimeout
  * whitelist
* **Implemented**
  * execute
    * `execute <modifiers> run <command>`
      * `<modifiers> <statement|braces>`
      * modifier arguments can have optional parentheses, mulitple statements can be put in braces
    * `align <axes>`
      * as in native, except axes must be sorted (zyx won't work)
    * `as <selector>`
    * `at <selector>`
    * `anchored (eyes|feet)`
    * `facing` 
      * not implemented yet, TODO
    * `in <dimension>`
    * `positioned <coord>`
      * `positioned <coord>`
      * `pos <coord>`
      * `(up|down|north|south|east|west) <float>` moves the execution position
        * adjacent moves are consolidated into single `positioned` modifier
    * `positioned as <selector>`
      * `positioned as <selector>`
      * `pos as <selector>`
    * `rotated <rotation>`
      * `rotated <rotation>`
      * `rot <rotation>`
      * `(up|down|left|right) <float>deg` changes the execution rotation
        * adjacent changes are consolidated into single `rotated` modifier
    * `rotated as <selector>`
      * `rot as <selector>`
    * `if block <pos> <block>`
      * `if [pos] <block>`
    * `if blocks` 
      * not implemented yet, TODO
    * `if data entity <selector> <path>`
      * `if(<selector>::<path>)`
    * `if data storage <resloc> <path>`
      * `if(&<resloc>::<path>)`
    * `if data block <coord> <path>`
      * not implemented yet, TODO
    * `if predicate <predicate>`
      * not implemented yet, TODO
    * `if score <selector1> <objective1> <op> <selector2> <objective2>`
      * `if <score1> <op> <score2>`
        * eg. `if @s->found_items <= @s->all_items`
    * `store success <target> ...` 
      * `<target> =? ...`
        * not implemented yet, think about it
    * `store result <target> ...` 
      * `<target> = ...`
    * `store result block <coord> <path> byte 1` 
      * not implemented yet, TODO
    * `store result bossbar` 
      * not implemented yet, think about it
    * `store result entity <selector> <path> byte 1`
      * `<selector>::<path> = ...`
    * `store result score <selector> <objective>`
      * `<selector>`**`->`**`<path> = ...`
    * `store result storage <resloc> <path> byte 1`
      * `&<resloc>::<path> = ...`
    * `run <command>`
      * `<statement|braces>`
      * just follow the modifiers with a statement or multiple statements in braces
    * 
  * `function <fn>`
    * `<fn>()`
  * `give`
  * `setblock <coord> <spec>`
    * `setblock [coord] <spec>`
      * `coord` defaults to `~ ~ ~`
  * `schedule replace <fn> <time> `
    * `after <time> <statement|braces>` 
  * `scoreboard objectives add `
    * `score <objective> [criterion]`
  * `scoreboard players set `
    * `<selector>-><objective> = <value>`
    * `$<name> = <value>`
  * `scoreboard players operation`
    * `<score1> <op> <value>`
  * `tag`
    * `tag <name>` 
      * declares a namespaced tag
  * `tag add <selector> <name>`
    * `tag <selector> <name> `
  * `tag remove <selector> <name>`
    * `untag <selector> <name> `
* **Custom**
  * print
