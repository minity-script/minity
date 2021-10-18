# ![logo](docs/mclang-logo-small.png) &nbsp;&nbsp;<big>mclang</big>
<big><b>scripting for Vanilla Minecraft</b></big>

Mclang is a scripting language which compiles to Vanilla Minecraft datapacks. It will allow you to develop complex datapacks in just a few files, and make your work easier by providing intuitive syntax for using some of the most powerful, but also hardest to use, Minecraft commands.

For some examples of what mclang can do, see [features](#features) below. Also check out the examples and full docs. Or just read on to get started.

<blockquote>
<b>Want to help?</b> Check out how you can contribute, and/or support us on Patreon.
</blockquote>

## Getting Started
#### Prerequisites
Mclang requires Minecraft 1.18 snapshots or later, and Node JS v16 or later.
#### Install mclang
````
npm install -g mclang
````
#### Create a mclang project
````
mkdir my_pack
cd my_pack
mclang create
````
This will create a basic mclang datapack for you, which will announce that it's loaded and do nothing else. The source code is in `./src/index.mclang`.

#### Build your datapack
````
mclang build
````
This will compile your datapack in the `./build` directory.

#### Install your datapack in a Minecraft world
````
mclang link
````
You will be presented with a list of your saves. Choose a world in which you want to test your datapack. You can run `mclang link` multiple times to add the datapack to multiple saves.

#### Enable and test your datapack in Minecraft.
Open your chosen world in Minecraft. 
````
/datapack enable file/my_pack
````
Your datapack will load and announce that it's loaded.

#### Developing your datapack
##### Consult documentation
Read the full docs [here](docs/intro.md).
##### Try the examples
````
mclang example 
````
Will create an example project. You will be given a list of examples to choose from.

##### Watch and recompile on change
````
mclang watch
````
All files in your `src` and `files` directories will be watch, and your datapack rebuilt on every change. Run `/reload` in Minecraft to load the rebuilt pack.

##### Syntax highlighting in IDES
There is currenty an extension for vscode, which provides syntax highlighting and error checking.

Its source code can be useful for creating extensions for other IDEs. If you create an extension, let us know and we will add it here.

## Contributing
Mclang is feature-rich, but it is a new software under development, so there might be rough edges.

You can help by reporting bugs, or if you are a programmer, by checking out the development page and contibuting patch requests.

For questions and answers, go to the mclang subreddit, or join our discord.

To help us devote more time to developing mclang, please consider supporting us on patreon.

## Features

#### Multiple functions in a single file
````
namespace my_pack

function hello() {
  say Hello!
}

function goodbye() {
  say Goodbye!
}
````
#### Easy tagging of functions
````
function again_and_again #minecraft:tick () {
  // will run on every tick
}
````
#### Intuitive syntax for scoreboard and nbt data operations
````
var $a = 1
$a *= 3

score wins
@s->wins++

@s::Invulnerable = true
append @p::Tags "my_tag"

````
#### Namespaced and scoped identifiers
````
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
#### Control stuctures with command grouping
```
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
#### True if / else
````
if (@s.processed) {
  untag @s processed
} else {
  // will only run if @s did not have the tag "processed"
}
````
#### Macros and constants
````
?greeting = "Hello"
say ?greeting

macro greet(?whom="World") {
  say ?greeting ?whom
}

greet()               // says "Hello World!"
greet("Everybody")    // says "Hello Everybody!"
````
#### Improved selector syntax
````
@chicken              // select by type
@#raider              // select by JSON tag
@e.my_tag             // select by mclang tag
@e!my_tag             // select by not mclang tag
@e{prop:value}        // select by NBT data
@e[->my_score > 10]   // select by entity score

// conditions can be combined
@chicken.evil!cursed[distance<20][->kills]

// sorting and limiting
nearest @chicken.evil       // select the nearest evil chicken
random 3 @chicken           // select 3 nearest chickens
furthest all @chicken       // select all chickens, sort by further
````
#### Raw Text XML
````
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
        <button onClick={ 
          say You clicked!
        }>
        CLICK ME!
        </button>
      </p>
    </div>
  ]
} 
````

