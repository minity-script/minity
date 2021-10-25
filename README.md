# ![logo](docs/minity-logo-small.png) &nbsp;&nbsp;<big>Minity</big>
<big><b>Sane scripting for Vanilla Minecraft JE</b></big>

Minity is a scripting language which compiles to Vanilla Minecraft datapacks. It will allow you to develop complex datapacks in just a few files, and make your work easier by providing intuitive syntax for using some of the most powerful, but also hardest to use, Minecraft commands.

![A sample of Minity code](docs/code-sample.png)

For some examples of what minity can do, see [features](#features) below. Also check out the examples and [full syntax docs](docs/SYNTAX.md). Or just read on to get started.

- <b>Want to help?</b> Check out how you can [contribute](#contributing), and/or [support us on Patreon](https://www.patreon.com/minity).

<blockquote>
<b>NOTE ON WINDOWS:</b> At this point, the functionality on Windows is patchy at best. You can create and build projects from the CLI, but not link them. You may have to copy your built datapacks to Minecraft saves for now. The interactive UI mostly does not work.

For best results at this point, try it on Linux.
</blockquote>

## Getting Started
#### Prerequisites
Minity requires Minecraft Java Edition 1.18 snapshots or later, and Node JS v16 or later.
#### Create a datapack with Minity
````
npx minity@latest
````
Minity's interactive menus will guide you through the process of creating a Minity project, linking it to Minecraft saves and building your datapack. 

If you prefer a command line interface, type `npx minity help` for available commands. You can of course also install Minity on your computer with `npm install -g minity@latest`, and use just `minity` instead of `npx minity` henceforth.

#### Enable and test your datapack in Minecraft.
Open your chosen world in Minecraft. 

Type `/datapack list` to see if your datapack is already enabled. If not, type `/datapack enable file/<my_pack>`;

Type `/reload`. Your datapack will load and run.

#### Developing your datapack
* **Consult documentation:** Read the full docs [here](docs/SYNTAX.md).
* **Try and study the examples:** You can create them with the interative menu, or using `npx minity create`
* **Watch your sources and recompile on change:** Choose the `watch` command in the menu, or use `npx minity watch`. All files in your `src` and `files` directories will be watched, and your datapack rebuilt on every change. Run `/reload` in Minecraft to load the rebuilt pack.
* **Syntax highlighting in IDES**: There is currenty an extension for vscode, which provides syntax highlighting and error checking. Its source code can be useful for creating extensions for other IDEs. If you create an extension, let us know and we will add it here.

## Contributing
Minity is feature-rich, but it is a new software under development, so there might be rough edges.

You can help by reporting bugs, or if you are a programmer, by checking out the source and contibuting patch requests.

To help us devote more time to developing minity, please consider supporting us on Patreon.

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
#### Easy scheduling
````
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
#### Promiseful macros
````
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
    /no stone found
  }
}
````

## License

Copyright 2021 Zoran Obradović

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
