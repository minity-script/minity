



### **if** / **unless** <small>[construct](defs#chainable)</small> <small>[chainable](defs#chainable)</small>

<def>*conditions* [*statement*](#statement)
*conditions* [*statement*](#statement) **else** [*statement*](#statement)
<br>conditions = *condition* (**and** *condition*)?
condition = **if** [*test*](#test) | **unless** [*test*](#test)</def>

`if` executes a statement or a block of statements if the condition is true.
````minity
if $a > 3 {
  say Larger than 3
} 
````
`unless` inverts the test, i.e. executes statements if the condition is not true.

````minity
unless $a > 3 {
  say Not larger than 3
}
````

#### **else** <small>[clause](defs#clause)</small>
Execute statements if the condition has failed. 
````minity
if $a > 3 {
  say Larger than 3
} else {
  say Not larger than 3
}
````
Note that Minity provides a true else, i.e. it does not run the test condition twice and fork execution by using `/execute if` and `/execute unless`

Instead, it pushes results of tests to a stack in data storage and runs the else statement(s) only if the test originally failed. This means that your if/else statements can be freely nested, and that they will still work correctly even when the original conditions change:

````minity
$a = 4
if $a > 3 {
  say Larger than 3
  $a = 2
} else if $a < 3 {
  if $a < 1 {
    say Zero!
  } else {
    say Smaller than 3      
  }
  $a++
} else {
  say Exactly 3!
}
````

#### **and** <small>[connector](defs#connector)</small>
Minecraft doesn't provide logical operators (AND, OR, etc.), but it does allow chaining of if/unless. You can use the `and` keyword to chain if/unless statemetns and thus ensure that `else` blocks apply to the correct conditions:
````minity

if $a > 3 and unless $a > 5 {
  say Just right!
} else {
  say Outside range
}

// these two are the same, but different from above

if $a > 3 unless $a > 5 {
  say Just right!
} else {
  say Outside range
}

if $a > 3 {
  unless $a > 5 {
    say Just right!
  } else {
    say Outside range
  }
}
````

### **repeat** <small>[construct](defs#construct)</small>

<def>**repeat** [*statement*](#statement) *loop_conditions* 
**repeat** [*statement*](#statement) *loop_conditions* **then** [*statement*](#statement)
<br>loop_conditions = *loop_condition* (**and** *loop_condition*)*
loop_condition = **while** [*test*](#test) | **until** [*test*](#test)</def>

Repeat the statements until the test is true or false.


````minity
var $count = 1
repeat {
  // this will repeat 10 times
  $count ++
} while $count <= 10
````
If the statements within the loop are preceeded with subcommands, they will be applied on each loop:
````minity
repeat forward 0.1 {
  // will move forward on each loop as long as the current block is air
} while air
````
#### **while** / **until** <small>[chainable](defs#chainable)</small>
`while` will continue the loop if the test is true and break it otherwise:
````minity
var $count = 1
repeat {
  // this will repeat 10 times
  $count ++
} while $count <= 10
````

`until` will break the loop if the test is true and continue it otherwise:
````minity
var $count = 10
repeat {
  // this will repeat 10 times
  $count --
} until $count == 0
````


#### **and** <small>[connector](defs#connector)</small>
You can combine several break conditions:
````minity
$count = 0;
repeat forward 0.1 {
  // will move forward on each step until stone is found stopping after at most 100 tries
  $count++
} until stone and while $count < 100 
````

#### **then** <small>[clause](defs#clause)</small>

If you provide a `then` clause, it will be run in the context of the last loop:

````minity
$count = 0;
repeat forward 0.1 {
  $count++
} until stone and while $count < 100 then {
  if(stone) say Stone found!
}
````

### Scheduling

Repetitions are scheduled with Minecraft's `schedule` command. This means that they don't inherit the execution context, so the following will not work as expected:
````minity
as nearest @chicken.evil {    // run following commands as the nearest chicken
  say I am evil
  every 1s {
    say "I am still evil"           
    // the current entity here is the Server, not the chicken
  }
}
````

#### **after** <small>[construct](defs#construct)</small>
<def>**after** [*time*](args#time) [*statement*](#statement)
**after** [*time*](args#time) [*statement*](#statement) **then** [*statement*](#statement)</def>

Run a statement (or a block of statements) after an interval has passed.
````minity
after 3600s {
  say You've been playing for an hour
}
````

##### **then** <small>[clause](defs#clause)</small>

If you provide a `then` statement it will be run at the end of the `after` block. This is useful for chaning scheduling calls, without having to nest them:

````minity
after 10s say 20 seconds left
then after 10s say 10 seconds left
then after 10s say Game over

// is the same as 
after 10s {
  say 20 seconds left
  after 10s {
    say 10 seconds left 
    after 10s {
      say Game over
    }
  } 
}
````

#### **every** <small>[construct](defs#construct)</small>

<def>**every** [*time*](#time)* [*statement*](#statement)
**every** [*time*](#time) [*statement*](#statement) *loop_conditions* 
**every** [*time*](#time) [*statement*](#statement) *loop_conditions* **then** [*statement*](#statement)
<br>loop_conditions = *loop_condition* (**and** *loop_condition*)*
loop_condition = **while** [*test*](#test) | **until** [*test*](#test)</def>

Run your statements at a regular interval.

````minity
every 300s {
  say Another 5 minutes have passed.
}

every 5t {
  // expensive operations that we want to run regularly, but not on every tick
}
````
##### **while** / **until** <small>[chainable](defs#chainable)</small>


You can provide break conditions that will stop the repetition:
````minity
var $running = false

function start() {
  say The minigame is beginning.
  $running = true
  every 1t {
    minigame_on_tick()
  } while $running
}

function stop() {
  $running = false
  say The minigame is ended.
}
````
##### **and** <small>[connector](defs#connector)</small>
You can combine several break conditions:
````minity
$count = 0;
repeat forward 0.1 {
  // will move forward on each step until stone is found stopping after at most 100 tries
  $count++
} until stone and while $count < 100 
````

##### **then** <small>[clause](defs#clause)</small>

If you provide a `then` clause, it will be run when the repetition ends:
````minity
every 1t {
  minigame_on_tick()
} while $running then {
  say Game Over
}
````


## Test conditions
### Compare integers
You can compare variables, scores and integer values.

The allowed operators are `== != < <= > >=`
````minity
if $a > 3 ...
if ( $a < @s->my_score ) ...  // you can use brackets if you prefer
if @s -> my_score == 3 ...
if ($a == 1..4) ....          // works with ranges
````
### Test a single block
To test for a block, you need to provide a block predicate, possibly preceded by a coordinate or directions. The block predicate can be as little as the id of the block. The block id can be namespaced, and the namespace defaults to `minecraft:`.
````minity
if air ...                    // is the block at the current position air
if #wood ...                  // you can use JSON block tags
if ~ ~2 ~ air ...             // you can use coordinates
if up 2 air ...               // or directions
if torch[facing=north]        // block states 
if chest{Items:[...]}         // block NBT values
````
Be careful when testing for NBT values, putting a space before the braces will cause incorrect parsing.

### Test for existence of entities
Simply provide a selector.
````minity
for @player {
  if @chicken.evil[distance<20] {
    say There are evil chickens nearby!
  }
}
````
### Test for existence of NBT data
Provide a data path. Not that this only tests for existence of data, not truthiness.
````minity
if @s::Inventory[{id:stone}]        // does this entity have any stone
if @@my_storage::foo                // test storage data
if (up 2)::Items[{id:stone}]        // test block nbt data

if @s::Invulnerable                 // true if the path has any value, even if it's 0 or false 
````
### Test predicate
````minity
if predicate my_predicate             // test my_predicate
if predicate other_ns:my_predicate    // you can use predicates from other namespaces
````
