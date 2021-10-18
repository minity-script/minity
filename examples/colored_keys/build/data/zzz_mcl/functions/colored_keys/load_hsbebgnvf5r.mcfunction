say Hello World
say Tutorial loaded
scoreboard players set --colored_keys-enabled --colored_keys--vars 1
execute as @p run tellraw @s [{"text":"\"enabled\""},{"text":" "},{"score":{"name":"--colored_keys-enabled","objective":"--colored_keys--vars"}}]
execute if score --colored_keys-enabled --colored_keys--vars matches 1.. run function colored_keys:update_all_locks
# function colored_keys:enable
# function colored_keys:disable
# function colored_keys:update_all_locks
# function colored_keys:give_blue_lock
# function colored_keys:give_red_lock
# function colored_keys:summon_blue_lock
# function colored_keys:summon_red_lock
# function colored_keys:give_blue_key
# function colored_keys:give_red_key
execute as @a[nbt={Inventory:[{tag:{is_book:1b}}]}] run function zzz_mcl:colored_keys/1_1f81d7y8uu2