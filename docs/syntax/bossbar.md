

# Bossbars
Minity provides syntactic sugar for setting and getting bossbar values.

### Adding and removing bossbars
````minity
bossbar add timer "Time left"
bossbar remove timer
````

### **bossbar** <small>[property accessor](defs#property-accessor)</small>
<code>**bossbar** *[bossbar_id](args#resloc)* lhand_property **=** ...</code><br>
<code>... **=** **bossbar** *[bossbar_id](args#resloc)* rhand_property</code><br>
<code>lhand_property = {**max**|**value**|**visible**|**players**|**style**|**name**}</code><br>
<code>rhand_property = {**max**|**value**|**visible**|**players**}</code>

Bossbar properties can be addressed with <code>**bossbar** bossbar_id {**max**|**value**|**players**|**visible**}</code>. They can be used in assignment statements. 
````minity
?max_time = 300

var $seconds_left = ?max_time

bossbar timer max = ?max_time
bossbar timer value = ?max_time
bossbar timer players = @a
bossbar timer visible = true
````

Numeric bossbar properties (value,max and visible) can be used both as left-hand and right-hand values in assignment statements:

````minity
var $current_value = bossbar timer value

every 1s {
  $seconds_left --
  bossbar timer value = $seconds_left
} while ($seconds_left > 0)  then {
  say Time has run out.
}
````


Set and get properties of bossbars. See also [bossbar](commands#bossbar) command.

#### **max** <small>[property](defs#property)</small>
Get or set the maximum value of a bossbar. 
#### **value** <small>[property](defs#property)</small>
Get or set the current value of a bossbar.
#### **visible** <small>[property](defs#property)</small>
Get or set visibility value of a bossbar.
#### **players** <small>[property](defs#property)</small>
Set the target selector for players who will see this bossbar, or get the current number of players who see it.
#### **name** <small>[property](defs#property)</small>
Set the display name of a bossbar. The value must be a Raw JSON Text.
#### **style** <small>[property](defs#property)</small>
Set the style of a bossbar. The value must be a one of `notched_6`,`notched_10`,`notched_12`,`notched_20`,`progress`