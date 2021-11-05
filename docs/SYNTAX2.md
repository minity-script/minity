

## Advancement events (experimental)

<blockquote>
<b>WARNING - EXPERIMENTAL FEATURE:</b> - This is not necessarily well thought out and will likely be removed or completely reworked. Use only for testing for now.

The same functionality could be achieved with a general construct for defining JSON files from Minity source and some macro magic. Alternatively, Minity could provide a better event system which would include score objective events.
</blockquote>

To run your code when a specific thing happens in the game:
````minity
on player_killed_entity{   // no whitespace allowed before the NBT tag opening brace
  entity: {
    id: "minecraft:slime"
  }
} then {
  say I killed a slime       // @s is the player that killed the entity,
                             // so this is said by that player
} 
````
This will create an advancement with a single criterion, using the supplied trigger and conditions. When the event occurs, i.e. the advancement is granted, the `then` statement(s) will be run and the advancement revoked, allowing the event to be detected again.

