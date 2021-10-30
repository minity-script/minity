
# Working with NBT data

### NBT Path

### <code>**::**</code> <small>[punctuation](defs#punctuation)</small>

You can access NBT data with the `::` operator, followed by a NBT path.
````minity
@s::NoAI                        // entity data
(0 0 0)::Items[{Slot:1}]       // block data
@@ns:storage_name::nbt.path     // storage data, ns is optional and defaults 
                                // to the current namespace
@@nbt.path                      // shorthand for @@current_ns:minity_vars storage
````

### Block NBT

### Entity NBT

### Storage NBT

### Assignment
You can assign anything to a data path, subject to limitations imposed by Minecraft itself.
````minity
@s::Pos[0]                          = ...
(up 2 north 3)::Items[{Slot:1}]     = ...
@@storage_name::my.stored.value     = ...
@@my.stored.value                   = ...
````
In addition to all integer sources accepted by variable assignment, NBT paths accept strings, typed numbers, and structured NBT data, as well as NBT paths.
````minity
... = "My Entity"
... = 12d
... = { numbers: [ "zero", "one", "two", "three" ] }
... = @s::Inventory[{Slot:1b}].Count
````
You can assign NBT paths to variables and entity scores. The value assigned will depend on the content of the NBT path, as returned by native `data get` command.
````minity
$value_of_number       = @s::MyNumber
$length_of_string      = @s::MyString
$length_of_list        = @s::MyList
$number_of_child_tags  = @s::MyCompound

... = 12d
... = { numbers: [ "zero", "one", "two", "three" ] }
... = @s::Inventory[{Slot:1b}].Count
````
When assigning values between NBT paths and variables or entity scores, you sometimes need to specify the data type or scale the value. This is most commonly used in entity and block data, where Minecraft accepts only a certain type of number, e.g. byte or double.
````minity
@s::Invulnerable = 1b * @s->is_divine
@s::Pos[1]       = 1d * @s->stored_altitude
$scaled_size     = 8 * @@stored_size
````

### **append** / **prepend** <small>[command](defs#command)</small>
<code>**append** *NBT_path* *data*</code>

Prepend and append data to NBT lists. 
````minity
@s::MyList = ["A String"]
append @s::MyList "Last String"
prepend @s::MyList "First String"
    // the list is now ["First String","A String","Last String"]
````
Accepts value sources accepted by NBT Path assignment.

### **insert** <small>[command](defs#command)</small>
<code>**insert** *index* [NBT_path](args#nbt-path) *data*</code>
Insert data into lists.
````minity
@s::MyList = ["First String"]
append @s::MyList "Last String"
insert 1 @s::MyList "A String"
    // the list is now ["First String","A String","Last String"]
````

### **merge** <small>[command](defs#command)</small>
<code>(**merge**) *NBT_path* *data*</code>
Merge the supplied value or the content of source path to the target path.
````minity
merge @s::MyList ["Another String"]
merge @p::AchievedQuestSteps @s::GrantQuestSteps
````

### **remove** <small>[command](defs#command)</small>

<code>**remove** *NBT_path* *value*</code>
Remove data at the target path.
````minity
@s::MyList = ["A String"]
append @s::MyList "Last String"
prepend @s::MyList "First String"
    // the list is now ["First String","A String","Last String"]
````
