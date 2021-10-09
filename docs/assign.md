### Assignment
* <tt>*target* **=** *source*</tt>

Assigns the value of source to the taget. See the list of valid targets and sources below.


Storage, bossbar and function ids are resource locations, which means they can be prefixed with `namespace:`

<s>Variable and score names are scoped to the namespace and the function. Namespace global variable and score names from other namespaces can be referenced by prefixing the names wih `namespace:`</s>

#### <tt>*target*</tt>

* **variables**
  * <tt><b>$</b>*variable_name* <b>=</b> ...</tt>
* **entity scores**
  * <tt><b>@</b>*selector*<b>-></b>*score_name* <b>=</b> ...</tt>
* **entity NBT**
  * <tt><b>@</b>*selector*<b>::</b>*nbt_path* <b>=</b> ...</tt>
* **storage NBT**
  * <tt><b>&</b>*storage_id*<b>::</b>*nbt_path* <b>=</b> ...</tt>
* **"storage vars" NBT**
  * <tt><b>&</b>*nbt_path* <b>=</b> ...</tt>
  * is shorthand for `&vars::target.path`
* **bossbar props**
  * <tt><b>bossbar</b> *bossbar_id* <b>value =</b> ...</tt>
  * <tt><b>bossbar</b> *bossbar_id* <b>max =</b> ...</tt>
  * <tt><b>bossbar</b> *bossbar_id* <b>visible =</b> ...</tt>

#### <tt>*source*</tt>
* All of the above, as well as:
* **integer constant**
  * <tt>... <b>= </b>*(integer|boolean)*</tt>
* **NBT data**
  * <tt>... <b>= </b>*(integer|boolean|float|string|compound|list}*</tt>
  * valid only for NBT targets
* **command**
  * <tt>... <b>= /</b>*command ...*</tt>
* **function call**
  * <tt>... <b>= </b>*function_id*<b>()</b></tt>

### Append, prepend
* <tt>**append** *NBT_target* *source*</tt>
* <tt>**prepend** *NBT_target* *source*</tt>

Appends or prepends a value to a NBT list. All assignment sources are accepted.

### Remove, delete
* <tt>**remove** *NBT_target*</tt>
* <tt>**prepend** *NBT_target* *source*</tt>

Appends or prepends a value to a NBT list. All assignment sources are accepted.
