

## Constants
Compile-time constants are denoted with the question-mark prefix: <code><strong>?</strong>constant_name</code>. A constant can contain any [value](values), and it will be replaced by its value when the datapack is compiled.

### Defining constants
Use the equals sign `=` to assign a value to a constant. 
````minity
?my_constant = 12
?my_other_constant = "foo"
?my_custom_name = {
  CustomName: json <t><b>Very</b> important item</t>
}
````
### Using constants
You can use defined constants wherever a value is expected in Minity code or native commands.
````minity
$time_left = ?total_time
repeat $counter++ until $counter>=?max
say This is {?server_name}
````

### Expansion in strings and commands
````minity
@s::CustomName = "My {?item}"
print {?foo} {?bar}   
/say {?foo} {?bar}   
````


### Scope of constants
````minity
?foo = 1
?bar = 1
function bar() {
  ?foo = 2              // ?foo is redefined within this function
                        // ?bar is inherited from the parent scope
}
````

## Function macros 
You can  define compile-time macro functions and pass arguments to them. The passed values will be usable as constants inside the macro.

### Defining macros
#### **macro** <small>[declaration](defs#declaration)</small>

Define macros using the `macro` keyword:
````minity
macro give_items(?id, ?count=1, ?damage=0b) {
  give @s ?count ?id{Damage:?damage}
}
````
A macro can accept arguments, and these may have default values.

### Using a macro
You can call macros in your code just as you would call a function. Arguments that have default values can be skipped, arguments can be named.

````minity
as @a give_items( torch, 5 )            // give each player 5 torches

function give_eggs {
  at @chicken as @p give_items( egg )   // for each chicken, give an egg to 
                                        // the nearest player
} 
function give_cracked_eggs {
  at @chicken as @p {
    give_items( egg, ?damage=99b )      // for each chicken, give a damaged egg to 
  }                                     // the nearest player
} 
````

You can call macros from within macros:
````minity
macro give_items(?id, ?count=10) {
  give @s ?count ?id
}

macro give_eggs (?count=1) {
  at @chicken as @p give_items( egg )   // for each chicken, give an egg to 
                                        // the nearest player
} 

give_eggs(10)
````
### Expansion of macros and recursion

Each macro call is expanded to an anonymous function at compile time, using the argument values supplied. This anonymous function will be called from the surrounding code.

You cannot direcly call macros recursively, since they are expanded at compile time. But the function created by the macro expansion can call itself recursively with `self()`:

#### **self()** <small>[pseudo-call](defs#pseudo-call)</small>

````minity
macro raycast_destroy(?block) {
  unless(block) {
    forward 0.1 self()
  } else {
    setblock air
  }
}
raycast_destroy(stone)
````
> Note that this will run forever, i.e. until Minecraft cuts off execution at 65,535 commands, if no stone is found, so it's not a good enough solution for raycasting by itself.



## Block macros
Block macros allow inclusion of whole code blocks as arguments. The macro will decide whether and when the supplied code blocks will be executed, so they can be thought of as promise-like. 

### Defining a block macro
Any macro can become promise-like by including `resolve()` and/or `reject` pseudo-function calls. These will include `then` and `catch` clauses when the macro is compiled into a function.
````minity
macro find_block (?block, ?distance = 5 ) {
  var $count = ?distance
  $count *= 10
  repeat forward 0.1 {
    $count--
  } while air and while $count > 0 then {
    if(?block) {
      resolve()           //include the then clause
    } else {
      reject()            //include the catch clause
    }
  }
}

````

#### **resolve()** <small>[pseudo-call](defs#pseudo-call)</small>
Call the `resolve()` pseudo-function within a macro definition to signal the positive outcome of the macro. This will be either the final `then` statement, .or the next promise call in the promise chain.


#### **reject()** <small>[pseudo-call](defs#pseudo-call)</small>

The `reject()` pseudo-function call within a macro definition will include the final `catch` statement, if any is provided. It will shortcut the promise chain.

### Using a block macro

#### **when** / **except** <small>[construct](defs#construct)</small> <small>[chainable](defs#chainable)</small>

<def>*block_calls* **then** [*statement*](#statement)
*block_calls* **then** [*statement*](#statement)* **catch** [*statement*](#statement)
<br>block_calls = *block_call* (**and** *block_call*)*
block_call = **when** *macro_call* | **except** *macro_call*</def>


Use the `when` construct to run some code in the execution context and at the time as provided by the macro.
````minity
function stone_destroyer() {
  when find_block(stone) then {
    setblock air
  }
}
````
To invert the meaning of `reject` and `resolve` in the compiled macro, use `except`:
````minity
function stone_seeker() {
  except find_block (stone) then {
    say No stone found!
  }
}
````
##### **then** <small>[clause](defs#clause)</small>
`when` and `except` clauses are followed by a `then` clause. This is included by the macro with the `resolve()` pseudo function call.
````minity
when find_block(stone) then {
  setblock air
} 
except find_block(stone) then {
  say No stone found!
}
````

##### **catch** <small>[clause](defs#clause)</small>
Optionally, the `then` clasue can be followed by a `catch` clause. This is included by the macro with the `resolve()` pseudo function call.
````minity
when find_block(stone) then {
  setblock air
} 
except find_block(stone) then {
  say No stone found!
} catch {
  setblock air
}
````
##### **and** <small>[connector](defs#connector)</small>

Like `if/else` and `while/until`, you can chain `when` and `except` promises with the `and` keyword.

Chained promises will call each other in turn. If any of them rejects the promise, the `catch` clause will be called and the chain cut short, otherwise the `then` clause will be called.
````minity
when find_block(stone) and when morning_only() then {
  say There's some morning rock!
} catch {
  say Now's not the time or place for that bad joke
}

// is the same as:

when find_block(stone) then {
  when morning_only() then {
    say There's some morning rock
  } catch {
    say Now's not the time or place for that bad joke  
  }
} catch {
  say Now's not the time or place for that bad joke
}
````
### Scope and context in block macro calls
The `then` and `catch` clauses are compiled in their *lexical scope*, i.e. in the scope of the function and namespace where they are written in the code, and that is where they inherit the declared variables, score names and tags from.

OTOH, they are run in whatever execution context (current entity, position, rotation, dimension) the macro called `reject()` or `resolve()`
