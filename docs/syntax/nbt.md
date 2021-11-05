
# Working with NBT data

### <code>**::**</code> <small>[punctuation](defs#punctuation)</small>

You can access NBT data with the `::` operator, followed by a NBT path.
````minity
@s::NoAI                        // entity data
(0 0 0)::Items[{Slot:1}]       // block data
@@ns:storage_name::nbt.path     // storage data, ns is optional and defaults 
                                // to the current namespace
@@nbt.path                      // shorthand for @@current_ns:minity_vars storage
````

NBT path is Minecraft's notation for accessing data stored in NBT tags. See [native documentation](https://minecraft.fandom.com/wiki/NBT_path_format) for details.

#### Entity NBT
<def>[*selector*](selector)<strong>::</strong>[*nbt_path*](args#nbt-path)</def>

To access Entity NBT data, combine a selector with a NBT path using the `::` operator.
````minity
@s::NoAI                        
nearest @item::Item.id
````
#### Storage NBT
<def>**@@**[*resource_location*](args#resloc)**::**[*nbt_path*](args#nbt-path)</def>

To access Storage NBT data, combine a storage resource location with a NBT path using the `::` operator. Storage resource locations are prefixed with `@@˙
````minity
@@my_storage                // defaults to the current namespace
@@other_ns:my_storage       // explicitly set a different namespace

@@my_storage::nbt.path
@@other_ns:my_storage::nbt.path
````

#### Block NBT
<def>[*position*](args#position)<strong>::</strong>[*nbt_path*](args#nbt-path)</def>


````minity
(~ ~ ~)::Items                     
(up 3 north 2)::Items
````

### Assignment

#### <code>**=**</code> <small>[operator](defs#operator)</small>

<def>*nbt_target* **=** *nbt_source*
*nbt_target* **=** (*scale* **\***)? *int_source*
<br>nbt_target = {*block_nbt_path*|*entity_nbt_path*|*storage_nbt_path*}
nbt_source = {*block_nbt_path*|*enity_nbt_path*|*storage_nbt_path*|*[*literal*](values)*}
int_source = {*variable*|*entity_score*|*bossbar_property*|[*integer*](values#integer)|[*statement*](defs#statement)}
scale = [*typed_number*](values#typed_numbers)</def>

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

### **append** <small>[command](defs#command)</small> :id=append
<def>**append** *nbt_target* *nbt_source*</def>

Prepend and append data to NBT lists. 
````minity
@s::MyList = ["First String"]
append @s::MyList "Last String"
````
Accepts value sources accepted by NBT Path assignment.

### **prepend** <small>[command](defs#command)</small>  :id=prepend
<def>**prepend** *nbt_target* *nbt_source*</def>

Prepend data to NBT lists. 
````minity
@s::MyList = ["Last String"]
prepend @s::MyList "First String"
````
Accepts value sources accepted by NBT Path assignment.


### **insert** <small>[command](defs#command)</small> :id=insert
<def>**insert** [*index*](values#integer) *nbt_target* *nbt_source*</def>

Insert data into lists.
````minity
@s::MyList = ["First String"]
append @s::MyList "Last String"
insert 1 @s::MyList "A String"
    // the list is now ["First String","A String","Last String"]
````

### **merge** <small>[command](defs#command)</small> :id=merge
<def>**merge** *nbt_target* *nbt_source*</def>

Merge the supplied value or the content of source path to the target path.
````minity
merge @s::MyList ["Another String"]
merge @p::AchievedQuestSteps @s::GrantQuestSteps
````
### **remove** <small>[command](defs#command)</small> :id=remove
<def>**remove** *nbt_target*</def>

Remove data at the target path.
````minity
@s::MyList = ["A String"]
append @s::MyList "Last String"
prepend @s::MyList "First String"
    // the list is now ["First String","A String","Last String"]
````
