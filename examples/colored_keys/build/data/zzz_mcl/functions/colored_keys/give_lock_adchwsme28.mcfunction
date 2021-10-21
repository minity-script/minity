# give @s command_block{
#    display: {
#      Name:  json [ {
#        color: "{?textColor}",
#        text: "Place {?Color} Lock",
#        italic: 0b
#      }],
#      Lore: [
#        json [{
#          text: "Place this command block to create a {?color} lock.",
#          italic: false
#        }] 
#      ]
#    },
#    BlockEntityTag:{
#      auto: 1b,
#      Command: "function colored_keys:summon_{?color}_lock"
#    }
#   }
give @s minecraft:command_block{display:{Name:'[{"color":"aqua","text":"Place Blue Lock","italic":0}]',Lore:['[{"text":"Place this command block to create a blue lock.","italic":0}]']},BlockEntityTag:{auto:1b,Command:"function colored_keys:summon_blue_lock"}} 1