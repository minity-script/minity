# clear @a written_book{
#     "{.book}": 1b,
#   }
clear @a minecraft:written_book{"--colored_keys-book":1b} 1
# give @a[gamemode=creative] written_book{
#     "{.book}": 1b,
#     pages: [
#       json <div> 
#         <h>COLORED KEYS</h>
#         <p>
#           Get Key
#           <b><t 
#             color = dark_red
#             text ="\u2588"
#             clickEvent= {
#               action: run_command,
#               value: "/function colored_keys:give_red_key"
#             }
#           /> <t color=dark_aqua 
#             text ="\u2588"
#             clickEvent= {
#               action: run_command,
#               value: "/function colored_keys:give_blue_key"
#             }
#           /> <t color=dark_green 
#             text ="\u2588"
#             clickEvent= {
#               action: run_command,
#               value: "/function colored_keys:give_green_key"
#             }
#           /> <t color=gold 
#             text ="\u2588"
#             clickEvent= {
#               action: run_command,
#               value: "/function colored_keys:give_yellow_key"
#             }
#           /></b>
#         </p>
#         <p>
#           Get Lock
#           <b><dark_red 
#             text ="\u2588"
#             clickEvent= {
#               action: run_command,
#               value: "/function colored_keys:give_red_lock"
#             }
#           /> <dark_aqua 
#             text ="\u2588"
#             clickEvent= {
#               action: run_command,
#               value: "/function colored_keys:give_blue_lock"
#             }
#           /> <dark_green 
#             text ="\u2588"
#             clickEvent= {
#               action: run_command,
#               value: "/function colored_keys:give_green_lock"
#             }
#           /> <gold 
#             text ="\u2588"
#             clickEvent= {
#               action: run_command,
#               value: "/function colored_keys:give_yellow_lock"
#             }
#           /></b>
#         </p>
#       </div>
#     ],
#     "title":"Colored Keys Handbook",
#     "author":"yockz",
#     "display":{
#       "Lore":[
#           "Commands and instructions for Colored Keys"
#         ]
#       }
#     }
give @a[gamemode=creative] minecraft:written_book{"--colored_keys-book":1b,pages:['{"text":"","extra":[[{"bold":true,"text":"","extra":["COLORED KEYS"]},"\\n\\n"],"",[{"text":"","extra":["Get Key","\\n",{"bold":true,"text":"","extra":[{"color":"dark_red","text":"█","clickEvent":{"action":"run_command","value":"/function colored_keys:give_red_key"}}," ",{"color":"dark_aqua","text":"█","clickEvent":{"action":"run_command","value":"/function colored_keys:give_blue_key"}}," ",{"color":"dark_green","text":"█","clickEvent":{"action":"run_command","value":"/function colored_keys:give_green_key"}}," ",{"color":"gold","text":"█","clickEvent":{"action":"run_command","value":"/function colored_keys:give_yellow_key"}}]},""]},"\\n\\n"],"",[{"text":"","extra":["Get Lock","\\n",{"bold":true,"text":"","extra":[{"text":"█","clickEvent":{"action":"run_command","value":"/function colored_keys:give_red_lock"},"color":"dark_red"}," ",{"text":"█","clickEvent":{"action":"run_command","value":"/function colored_keys:give_blue_lock"},"color":"dark_aqua"}," ",{"text":"█","clickEvent":{"action":"run_command","value":"/function colored_keys:give_green_lock"},"color":"dark_green"}," ",{"text":"█","clickEvent":{"action":"run_command","value":"/function colored_keys:give_yellow_lock"},"color":"gold"}]},""]},"\\n\\n"],""]}'],title:"Colored Keys Handbook",author:"yockz",display:{Lore:["Commands and instructions for Colored Keys"]}} 1