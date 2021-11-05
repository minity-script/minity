## Values and types
Minity supports all the values supported by NBT tags. Like in .mcfunction, they are written in JSON-like syntax, with some relaxations, e.g. keys in compounds don't have to be quoted

## Numbers

### Integer

Any integer value. Can include the sign.
````minity
+1
-100
````
### Float

Any float value. Can include the sign and/or an exponent. In contexts where float values are implied, an integer value will be accepted as well.
````minity
3.14
+6.02E23
-273.4
42
````
### Typed Numbers

In some contexts, notable when dealing with NBT data, typed numbers are required. The type of the number is specified by a suffix letter for each type.
````minity
1b        // byte
1s        // short
1i        // integer
1         // defaults to integer
1l        // long

3.14f     // float
3f        // still float
3.0       // defaults to float
1.2d      // double
````
## String
````minity
"my name"                 // an ordinary string
"\n \" \u2312 "           // accepts standard escape sequences
````
### Replacement patterns

Some bracketed sequences have a special meaning within doublequoted strings. These are all expanded by minity during compilation. They can be used anywhere where strings are accepted in the code.

## List
List is the NBT equivalent of a JSON array. Its items are listed inside square brackets separated by commas. Can contain items of any NBT type.
````minity
[1, 2, 3]
[foo,bar,baz]

// can span across multiple lines
[
  { name: "john", born: 1940 },
  { name: "paul", born: 1942 },
  { name: "george", born: 1943 },
  { name: "ringo", born: 1940 }
]
````
## Compound
Compound is the equivalent of a JSON object. It contains key-value pairs, listed within curly braces. Keys must be strings, values can be of any NBT type.

````minity
{ a:1, b:2, c:3 }

// can span across multiple lines
[
  "First String",
  "Second String",
  "Last String"
]

{a:1,b:2,c:"not a number"}    // will work, all values are accepted
{[1]:"bad key"}               // the key must be a string or convertable to string
````
## JSON String
Some Minecraft commands and properties accept JSON strings as values. To convert any value to a json string, prefix it with `json`
````minity
json 1           => "1"
json true        => "true"
json "name"      => '"name"'
json {
  a:b,
  c:[1,2,3]
}               => '{"a":"b","c":[1,2,3]}'
````
## SNBT String
Some Minecraft commands and properties accept SNBT strings as values. These are similar to JSON, but can also encode number types. 

<blockquote>
TODO: Because NBT lists don't accept different types of items inside the same list, this should fail on compilation for non-compliant data.
</blockquote>

````minity
snbt 1b                     => "1b"
snbt true                   => "1b"
snbt "name"                 => '"name"'
snbt [a,b,c]                => '["a","b","c"]'
snbt [1,2,"not_a_number"]   // not allowed
````
## Raw Text Markup
Raw Text is a powerful feature of Minecraft, but also notoriously hard to write. The ability for array and objects to span across multiple lines can help to an extent. But minity can make it even easier for you, by using raw text markup, which is similar to HTML.

````minity
<div>
  <p color=red bold=true>
    My <i>Very</i> Red Book
  </p>
  <p>
    The book is red, 
    but <span color=green>
      this text is green.
    </span>
    Click <u 
      color=blue
      text="here"
      clickEvent={
        action: command,
        value: "/say something"
      }
    /> to say something.
  </p>
</div>
````
<blockquote>
<tt><b style="color:red">My <i>very</i>  Red Book</b></tt><br/><br/>
<tt>This book is red,</tt><br/>
<tt>but <span style="color:green">this text is green.</tt><br/>
<tt>Click <u style="color:blue">here</u> to say something.</tt><br/>
</blockquote>

### Tags

You can use any tag names, as long as opening and closing tags match, but some tags hava aspecial meaning. Tags can be self-closing, which usually means tha they will display the value of the `text` attribute, if any.

* `<div>` or `<d>` will remove all whitespace directly on its inside, and ensure that there is exactly one newline before and after it, except at beginning or end of raw text.
* `<p>` will remove all whitespace directly on its inside, and ensure that there is exactly one newline before it and two after it, except at beginning or end of raw text.
* `<h>` is like `<p>`, but with bold already applied.
* `<span>` or `<t>`will remove all whitespace directly on its inside. This also applies to all other tags.

In all cases, the spaces and newlines within the tag, but not directly adjacent to the tag will be preserved, but each line will be trimmed, i.e. all spaces at begnning and end of line removed. Text within the `text` attribute will be included as is.

* `<reset>` removes all formatting
* `<i>` italic
* `<b>` bold
* `<u>` underlined
* `<s>` strikethrough
* `<o>` obfuscated
* `<red>, <blue>, ...` Text color. See minecraft documentation for alloed color names.


### Attributes
Attributes within tags directly set the properties of the raw text object. They accept any JSON value. Refer to raw text documentation for properties and values you can use.
````minity
<span 
  text="click me" 
  underline=true 
  clickEvent={
    action: command,
    command: "/say you clicked me"
  }
/>
````
### Raw text JSON strings
Raw text markup will produce JSON objects which will be output as valid JSON in compiled code. In some cases, Minecraft expects raw text to be specified as a JSON string. To turn raw markup into a json string, use the `json` keyword:
````minity
summon chicken{
  CustomName: json <red>Evil Chicken</red>
}

  ==> /summon minecraft:chicken{CustomName:'{"text":"","color":"red","others":["Evil Chicken"]}'}
````
