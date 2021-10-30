

# Entity tags
Tags are used for grouping entities in useful ways. You need to declare tags before using them. Tags are namespaced and scoped.

### **tag** <small>[declaration](defs#declaration)</small>
<code>**tag** *[tag_name](args#ident)*</code>

Declare a scoped tag. The tag name will be scoped to the current namespace and function.


````minity
tag processed
tag evil
````


### **tag** <small>[command](defs#command)</small>

<code>**tag** *[selector](selector)* *[tag_name](args#ident)*</code>

Add a scoped tag to one or multiple entities.

````minity
tag @chicken evil
````

### **untag** <small>[command](defs#command)</small>

<code>**untag** *[selector](selector)* *[tag_name](args#ident)*</code>
Remove a scoped tag from one or multiple entities.
````minity
untag @s processed
````

### Selecting entities by tag
To select entities by tags, use the `.tag_name` and `!tag_name` selector conditions. See selector syntax below.

