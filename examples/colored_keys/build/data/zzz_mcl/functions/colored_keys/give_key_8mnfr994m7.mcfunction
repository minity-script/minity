# give @s shield{
#     display: {
#       Name: json [{
#         "text":"{?Color} Key",
#         "italic":false
#       }],
#       Lore: [ 
#         json [{
#           "text":"This key opens {?color} doors.",
#           "italic":false
#         }]
#       ]
#     },
#     Tags: ["{.is_key}","{.is_{?color}_key}"],
#     //"{.is_key}": 1b,
#     //"{.is_{?color}_key}":1b,
#     BlockEntityTag: {
#       Base: ?baseColor,
#       Patterns: [
#         { Color: 15, Pattern:"mc" },
#         { Color: 15, Pattern:"bt" },
#         { Color: ?baseColor, Pattern:"bo" }
#       ]
#     }
#   }
give @s minecraft:shield{display:{Name:'[{"text":"Blue Key","italic":0}]',Lore:['[{"text":"This key opens blue doors.","italic":0}]']},Tags:["--colored_keys-is_key","--colored_keys-is_blue_key"],BlockEntityTag:{Base:3,Patterns:[{Color:15,Pattern:"mc"},{Color:15,Pattern:"bt"},{Color:3,Pattern:"bo"}]}} 1