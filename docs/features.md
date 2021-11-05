### Multiple functions in a single file
````minity
namespace my_pack

function hello() {
  say Hello!
}

function goodbye() {
  say Goodbye!
}
````
### Easy tagging of functions
````minity
function again_and_again #minecraft:tick () {
  // will run on every tick
}
````
### Grouping commands with braces
````minity
  function kill_evil_chickens () {
    as @player {
      say Hello
      as @chicken.evil[ distance < 20 ] {
        say My reigh of terror is over
        kill @s
      }
    }
  }
````
### True if / else
````minity
if (@s.processed) {
  untag @s processed
} else {
  // will only run if @s did not have the tag "processed"
}
````
### Intuitive scoreboard and NBT operations
````minity
var $a = 1
$a *= 3

score wins
@s->wins++

@s::Invulnerable = true
append @p::Tags "my_tag"

````
### Namespaced and scoped identifiers
````minity
namespace my_pack
var $foo
var $bar
function do_something() {
  var $foo 
  $foo ++     // separate variable from outside $foo
  $bar ++     // the same as outside $bar
}

namespace other
var $foo     // separate from $foo in my_pack
$bar++       // error, does not exist in namespace other

````

### Macros and constants
````minity
?greeting = "Hello"
say ?greeting

macro greet(?whom="World") {
  say ?greeting ?whom
}

greet()               // says "Hello World!"
greet("Everybody")    // says "Hello Everybody!"
````
### Improved selector syntax
````minity
@chicken              // select by type
@#raider              // select by JSON tag
@e.my_tag             // select by minity tag
@e!my_tag             // select by not minity tag
@e{prop:value}        // select by NBT data
@e[->my_score > 10]   // select by entity score

// conditions can be combined
@chicken.evil!cursed[distance<20][->kills]

// sorting and limiting
nearest @chicken.evil       // select the nearest evil chicken
random 3 @chicken           // select 3 nearest chickens
furthest all @chicken       // select all chickens, sort by further
````
### Raw Text markup
````minity
@s::CustomName = <span color="red" italic=false>Red Item</span>

tellraw @player[->my_score<10] You have <b>only</b> {@s->my_score} points!

give @s written_book{
  Pages: [
    json <div>
      <h>My <i>very</i> interesting book</h>
      <p>
        Read this page, or go to the <a page=2>next</a>.
      <p>
      <p>
        <span 
          color="red" 
          clickEvent = {
            action:  run_command,
            command: "/say You clicked!"
         }
        />
        CLICK ME!
        </button>
      </p>
    </div>
  ]
} 
````
### Easy scheduling
````minity
  $time_left = 300;
  after 3s {
    $time_left -= 3:
    say time is passing
  } then after 4s {
    $time_left -= 4:
    say some more time has passed
  } then every 20s {
    $time_left -= 20:
    say time keeps passing
  } until ($time_left <= 0 ) then {
    say all the time has passed
  }
````
### Block macros
````minity
macro find_stone() {
  var $max = 20
  repeat forward 0.2 {
    $max--
  } while $max and until stone then {
    if (stone) resolve() else reject()
  }
}
function stone_destroyer() {
  when find_stone then {
    setblock air
  } catch {
    say no stone found
  }
}
````
