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
give @s minecraft:shield{display:{Name:'[{"text":"Red Key","italic":0}]',Lore:['[{"text":"This key opens red doors.","italic":0}]']},Tags:["--colored_keys-is_key","--colored_keys-is_red_key"],BlockEntityTag:{Base:14,Patterns:[{Color:15,Pattern:"mc"},{Color:15,Pattern:"bt"},{Color:14,Pattern:"bo"}]}} 1