
| token | in strings and native commands| in raw text markup|
|-|-|-|
|<nobr>`{?color}`</nobr>| value of the constant<br>e.g. `red` | same |
|<nobr>`{.processed}`</nobr>|internal name of the tag<br>e.g.`--my_ns-processed"`| same |
|<nobr>`{->my_score}`</nobr>|internal name of the score objective<br>e.g.`--my_ns-my_score"`| same |
|<nobr>`{@item}`</nobr>|compiled selector<br>e.g.`@e[type=item]"`| same |
|<nobr>`{(upward 1 forward 3)}`</nobr>|compiled coordinates<br>e.g.`^ ^1 ^3`| same |
|<nobr>`{$my_var}`</nobr>|internal target and objective of the variable<br>e.g.`--my_ns-my_var --my_ns--vars`|value of the variable|
|<nobr>`{@s->my_score}`</nobr>|compiled selector and objective<br>e.g.`@s --my_ns-my_score`|value of the score
