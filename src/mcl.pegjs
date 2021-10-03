{
  const _N = options.N || (($,props,location) => ({$,...props,location}));
  const N = ($,props) => { 
    const loc = location();
    const node = _N($,props,loc)
    if(!loc) debugger;
    return node;
  }
}

file = _ head:namespace tail:(EOL _ @namespace)* _{
  return N("file",{namespaces:[head,...tail]})
}
//\\ globals
  namespace 
    = "namespace" __ ns:IDENT EOL _ globals:globals {
        return N("namespace",{ns,globals})
      }

  globals 
    = head:global tail:(EOL _ @global)* {
        return [head,...tail]
      }

  global 
    = function
    / macro
    / statement

  function 
    = "function" __ name:IDENT _ "{" _ statements:statements _ "}" {
        return N( "function", { name,statements } )
    }

//\\ macro

  macro = "macro" __ name:IDENT args:macro_args _ "{" _ statements:statements _ "}" {
      return N( "macro", { name,args,statements } )
  }

  arg_name = "?" @WORD

  //\\ macro_args
    macro_args = _ "(" _ head:macro_arg tail:(COMMA @macro_arg)* _ ")" {
      return [head,...tail]
    }


    macro_arg = name:arg_name def:macro_arg_default? {
      return {name,def}
    }

    macro_arg_default = EQUALS @macro_arg_literal

    macro_arg_literal = value

  //\\ call_args
    call_args 
    = numbered:call_args_numbered named:(COMMA @call_args_named)? {
      return {numbered,named:named||{}}
    }
    / named:call_args_named {
      return {numbered:[],named}
    }

    call_args_numbered = head:call_arg_numbered tail:(COMMA @call_arg_numbered)* {
      return [head,...tail]
    }

    call_arg_numbered = _ value:macro_arg_literal  {
      return value
    } / & (_ ",")

    call_args_named = head:call_arg_named tail:(COMMA @call_arg_named)* {
      return [head,...tail]
    }

    call_arg_named = name:arg_name EQUALS value:macro_arg_literal {
      return {name,value}
    }


//\\ statements
  statements 
    = head:statement tail:(EOL _ @statement)* {
      return [head,...tail]
    }

  statement 
    = command
    / declare_var
    / declare_score
    / tag_set
    / tag_unset
    / declare_tag
    / print
    / cmd
    / execute
    / if_else
    / call
    / assign

//\\ print
  print = "print" selector:(__ @selector)? __ parts:print_parts {
    return N("print",{selector,parts})
  }

  print_parts = head:print_part tail:(print_sep print_part)* {
    return [head,...tail].flat().filter(Boolean);
  }

  print_sep 
  =  __ { return N("print_space")}
  / __? "," __? { return false }

  print_part 
  = name:var_name { return N("print_var",{name})}
  / value:string { return N("print_string",{value})}
  / value:value { return N("print_value",{value})}

//\\ commands

  command = _ "/" command:$([^\n]+) {
    return N( "command", { command  } )
  }

  cmd = cmd_give

  cmd_give = "give" __ selector:selector __ type:resloc nbt:(_ @object)? {
    return N( "cmd_give", { selector,type,nbt } )
  }

//\\ call
  call = name:IDENT _ "(" _ ")" {
    return N( "call", { name } )
  }
  / name:IDENT _ "(" _ args:call_args _ ")" {
    return N( "macro_call", { name,args } )
  }

//\\ execute
  execute = mods:mods _ code:code {
    return N( "execute", { mods,code } )
  }
  mods = head:mod tail:_mod * {
    return [head,...tail]
  }
  _mod = __ mod:mod {
    return mod;
  }
  mod 
  = "align" __ axes:("xyz"/"xy"/"xz"/"yz"/"x"/"y"/"z") {
    return N( 'mod_align', { axes } )
  }
  / "anchored" __ anchor:("eyes"/"feet") {
    return N( 'mod_align', { axes } )
  }
  / "as" __ selector:selector {
    return N( 'mod_as', { selector } )
  }
  / "at" __ selector:selector {
    return N( 'mod_at', { selector } )
  }
  / "for" __ selector:selector {
    return N( 'mod_for', { selector } )
  }
  / "in" __ dimension:resloc {
    return N( 'mod_in', { dimension } )
  }
  / "pos" "itioned"? __ "as" __ selector:selector {
    return N( 'mod_pos_as', { selector } )
  } 
  / "pos" "itioned"? __ pos:pos_any {
    return N( 'mod_pos', { pos } )
  }
  / head:mod_dir tail:_mod_dir* {
    return N( "mod_dir", { mods:[head,...tail] } )
  }
  / "if" __ test:test ! (_ code else) {
    return N( "mod_if", { test } )
  } 
  / "unless" __ test:test  ! (_ code else) {
    return N( "mod_unless", { test } )
  }


  _mod_dir = __ mod:mod_dir {
    return mod
  }
  mod_dir 
  = ("up"/"U") _ n:number {
    return {dir:"y",off:n,f:1}
  }
  / ("down"/"D") _ n:number {
    return {dir:"y",off:n,f:-1}
  }
  / ("north"/"N") _ n:number {
    return {dir:"z",off:n,f:-1}
  }
  / ("south"/"S") _ n:number {
    return {dir:"z",off:n,f:1}
  }
  / ("east"/"E") _ n:number {
    return {dir:"z",off:n,f:1}
  }
  / ("west"/"W") _ n:number {
    return {dir:"z",off:n,f:1}
  }

  pos_any = pos_abs/pos_rel/pos_from

  pos_abs
  = "[" _ x:coord_abs __ y:coord_abs __ z:coord_abs _ "]" {
    return N( "pos_abs", { x,y,z } )
  }

  pos_rel
  = "(" _ x:number __ y:number __ z:number _ ")" {
    return N( "pos_rel", { x,y,z } )
  }

  pos_from
  = "<" _ x:number __ y:number __ z:number _ ">" {
    return N( "pos_from", { x,y,z } )
  }

  coord_abs 
  = "~" number:number {
    return "~"+number
  } / number

  code 
  = "{" _ statements:statements _ "}" { 
    if (statements.length===1) return statements[0]
    return N( 'code', { statements:statements } )
  }
  / statement

//\\ selector
  selector "selector"
    = sort:selector_sort? "@" head:(initial/initial_type) conditions:conditions {
      return N( "selector", { head,conditions:[...sort||[],...conditions] } )
    }
    
  //\\ sort
    selector_sort 
    = sort:("nearest"/"random"/"furthest"/"arbitrary") limit:(__ @number) ? __ {
      if (!limit) return [N('cond',{name:"sort",op:"=",value:sort})]
      return [
        N('cond_brackets',{name:"sort",op:"=",value:sort}),
        N('cond_brackets',{name:"limit",op:"=",value:limit}),
      ]
    }
    
  //\\ initial
    initial
    = initial:[a-z] ![a-z0-9_]i {
      return N( "initial", { initial } )
    }

    initial_type
    = type:resloc_mc {
      return N( "initial_type", { type } )
    }

  //\\ conditions
    conditions = parts:condition_part* {
      return parts.flat()
    }

    condition_part = condition_tag/condition_brackets

    condition_tag 
    = "." value:string { return [N( "cond_brackets", { name:"tag", op:"=", value }) ]  }
    / ".!" value:string { return [N( "cond_brackets", { name:"tag", op:"=!", value }) ]   }

    condition_brackets "brackets" 
      = "[" _ 
        head:cond_brackets 
        tail:(COMMA @cond_brackets)* 
        _ "]" {
        return [head,...tail]
      }
    
    cond_brackets "condition" 
      =   node: 
          (	 ($("d"? [xyz] / [xy] "_rotation") cond_op number )
          /  (( "nbt" ) cond_op json )
          /  (( "type" ) cond_op resloc_mc )
          /  (( "predicate" ) cond_op resloc )
          /  (( "distance" / "level") cond_op range )
          /  (( "tag" / "team") cond_op string? )
          /  (( "name")         cond_op string )
          /  (( "sort")         cond_op sort_name )
          /  (( "limit")        cond_op int)
          /  (( "gamemode")     cond_op gamemode)
          /  (( "scores")       cond_op cond_brackets_scores)
          /  (( "advancements") cond_op cond_brackets_advancements)
          )
        {
          const [name,op,value] = node;
          return N( "cond_brackets", {name,op,value} )
        }

    cond_op
      = _ @$("=" "!"?) _

    cond_brackets_scores "scores"
      = "{" _ 
        head: cond_brackets_score 
        tail: (COMMA @cond_brackets_score)*
        _ "}" {
          return N("cond_brackets_braces", {items: [head, ...tail]})
        }

    cond_brackets_score
      = name:ident EQUALS value:range {
          return N("cond_brackets_pair", {name,value})
        }

    cond_brackets_advancements 
      = "{" _ 
        head: cond_brackets_advancement
        tail: (COMMA @cond_brackets_advancement)*
        _ "}" {
          return N("cond_brackets_braces", {items: [head, ...tail]})
        }

    cond_brackets_advancement
      = name:resloc_mc EQUALS value:bool {
          return N("cond_brackets_pair", {name,value})
        }
      / "{" _ 
        head: cond_brackets_advancement_criterion
        tail: (COMMA @cond_brackets_advancement_criterion)*
        _ "}" {
          return N("cond_brackets_braces", {items: [head, ...tail]})
        }

    cond_brackets_advancement_criterion
      = name:ident EQUALS value:bool {
          return N("cond_brackets_pair", {name,value})
        }
    
    sort_name 
      = ( "nearest" / "closest" ) { return "nearest" }
      / ( "furthest" / "farthest" ) { return "furthest" }
      / ( "random" / "any" ) { return "random" }
      / ( "arbitrary" / "oldest" ) { return "arbitrary" }

    gamemode
      = "survival"
      / "creative"
      / "adventure"
      / "spectator"

//\\ assign
  assign = assign_scoreboard / assign_datapath / delete_datapath

  

//\\ if_else
  else = _ "else" __ @code

  if_else = head:("if"/"unless") __ test:test _ code:code _else:else {
    return N( "if_else", { head, test,code,_else } )
  }

  //\\ test
    test = test_scoreboard/test_entity/test_datapath

    test_entity = selector:selector {
      return N( "test_entity", { selector } )
    } 

//\\ tag
  declare_tag
    = "tag" __ name:IDENT {
        return N("declare_tag",{name})
      }
  tag_set
    = "tag" __ selector:selector __ tag:tag_id {
        return N("tag_set",{selector,tag})
      }
  tag_unset
    = "untag" __ selector:selector __ tag:tag_id {
        return N("tag_unset",{selector,tag})
      }
    
  tag_id 
    = name:ident {
      return N("tag_id",{name})
    }

//\\ scoreboard
  var_name 
    = "$" @IDENT 
  var_id
    = name:var_name {
      return N("var_id",{name});
    }
  constant_id 
    = value:int {
      return N("constant_id",{value});
    }
  score_id 
    = holder:score_holder _ "->" _ id:ident {
      return N( 'score_id', { holder,id } )
    }
  score_holder 
    = selector 
    
  scoreboard_id 
    = var_id 
    / constant_id 
    / score_id

  declare_var 
    = "var" __ name:var_name value:(EQUALS @number)? {
        return N("declare_var",{name,value})
      }
 
  declare_score 
    = "score" __ name:IDENT {
      return N("declare_score",{name,criterion:"dummy"})
    }
 
  
  //\\ assign_scoreboard
    assign_scoreboard
      = left:scoreboard_lhand _ 
          assign: (
            "=" _ right: number {
              return N( "assign_scoreboard_value", { right } )
            }
          / op:assign_scoreboard_op _ right:scoreboard_id {
              return N( "assign_scoreboard_operation", { left, op, right } )
            }
          / "++" {
            return N( "assign_scoreboard_inc",{})
            }
          / "--" {
            return N( "assign_scoreboard_dec",{})
            }
          / "=" _ right:datapath {
              return N( "assign_scoreboard_datapath", { right } )
            }
          / "=" _ right:statement {
              return N( "assign_scoreboard_statement", { right } )
            }
        ) {
          assign.left = left;
          return assign;
        } 
    scoreboard_lhand 
      = var_id
      / score_id
      

    assign_scoreboard_op 
      = "="
      / "+="
      / "-="
      / "*="
      / "/="
      / "%="

  //\\ test_scoreboard
    test_scoreboard
      = left:scoreboard_id _ op:test_scoreboard_op _ right:scoreboard_id {
          return N( "test_scoreboard",{left,op,right})
        }
    test_scoreboard_op 
      = "<="
      / ">="
      / ">"
      / "<"
      / @"=" "="?

//\\ nbt
  //\\ datapath
    datapath 
      = head:datahead "::" steps:datapath_steps {
          return N( "datapath", { head,steps } )
        } 
      / datapath_var

    datahead 
      = datahead_entity
      / datahead_storage

    datahead_entity 
      = selector:selector {
          return N( "datahead_entity", { selector } )
        }

    datahead_storage 
      ="&" name:resloc {
          return N( "datahead_storage", { name } )
        }

    datapath_var 
      = "&" steps:datapath_steps { return N( "datapath_var", { steps  } ) }

    datapath_steps 
      = head:datapath_step tail:("." @datapath_step)* { return [head,...tail] }

    datapath_step 
      = json
      / IDENT
  //\\ assign_datapath
    assign_datapath 
      = left:datapath EQUALS assign:assign_datapath_rhand {
        assign.left = left;
        return assign;
      }

    assign_datapath_rhand
      = right:value {
        return N( "assign_datapath_value", { right } )
      }
      / right:scoreboard_id {
        return N( "assign_datapath_scoreboard", { right } )
      }
      / right:datapath {
        return N( "assign_datapath_datapath", { right } )
      }
      / right:statement {
        return N( "assign_datapath_statement", { right } )
      }

    delete_datapath 
      = ("delete"/"remove") __ path:datapath {
        return N( "delete_datapath", { path } )
      }
  //\\ test_datapath
    test_datapath = path:datapath {
        return N( "test_datapath", { path } )
      } 

//\\ parts
  resloc
    = resloc_full
    / name: ident {
        return N( "resloc", { name } )
      }

  resloc_full 
  	= ns:ident ":" name:ident {
        return N( "resloc", { ns,name } )
      }
  
  resloc_mc
    = resloc_full
    / name: ident {
        return N( "resloc", { ns:"minecraft", name } )
      }

  range 
    = from:number _ ".." to:number { return N( "range", { from,to } ) }
    / ".." to:number { return N( "range_to", { to } ) }
    / from:number _ ".."{ return N( "range", { from } ) }
    / number
  json 
    = json:value {
        return N( "json", { json } )
      }
    /*
      JSON_text
        = _ value:value _ { return value; }
    */

//\\ values
  value
    = value_arg
    / value_lit

  value_arg "value argument"
    = name:arg_name {
        return N( "arg", { type:"value",name } )
      }

  value_lit
    = bool
    / object
    / array
    / number
    / string

  //\\ bool
    bool 
      = bool_arg/bool_lit
    bool_arg "bool argument"
      = name:arg_name {
          return N( "arg", { type:"bool",name } )
        }

    bool_lit
      = "true" { return N( "literal", { type:"bool", value: true  } ) }
      / "false" { return N( "literal", { type:"bool", value: false  } ) }

  //\\ object
    object 
      = object_arg
      / object_lit
    
    object_arg "object argument"
      = name:arg_name { 
          return N( "arg", { type:"object",name } ) 
        }


    object_lit
      = _ "{" _
        members:(
          head:member tail:(COMMA @member)* {
            return [head,...tail];
          }
        )?
        _ "}"_
        { return N( "literal", { type:"object",members:members||[] } ) }
    member
      = name:(string) _":"_ value:value {
          return { name: name, value: value };
        }


  //\\ array
    array 
      = array_arg
      / array_lit

    array_arg 
      = name:arg_name {	return N( "arg", { type:"array",name } ) }

    array_lit
      = "["_
        items:(
          head:value
          tail:(COMMA @value )*
          { return [head].concat(tail); }
        )?
        _"]"
        { return N( "literal", { type:"array", items: items || [] } ) }
  
  //\\ number
    number 
      = number_arg
      / number_lit
    number_arg 
      = name:arg_name {	
          return N( "arg", { type:"number",name } ) 
        }
    number_lit 
      = float_lit
      / int_lit

    int 
      = int_arg
      / int_lit
    int_arg 
      = name:arg_name {	
          return N( "arg", { type:"int",name } ) 
        }

    int_lit "integer" 
      = value:INT suffix:[bsli]? {
          return N( "literal", { type:"int",value:+value,suffix } )
        }

    float "float" 
      = float_arg
      / float_lit

    float_arg 
      = name:arg_name {	
          return N( "arg", { type:"float",name } ) 
        }
    float_lit 
      = value:FLOAT suffix:[fd]? {
          return N( "literal", { type:"float",value:+value,suffix } )
        } 
      / value:INT suffix:[fd] {
          return N( "literal", { type:"float",value:+value,suffix } )
        }

    FLOAT
      = value:$(INT (FRAC EXP?/EXP)) { return +value }

    EXP
      = [eE] ([-+])? [0-9]+

    FRAC
      = "." [0-9]+

    INT
      = value: $([+-]? ("0"/[1-9][0-9]*)) { return +value }


  //\\ ident
    ident 
      = ident_arg
      / ident_lit

    ident_arg 
      = name:arg_name { 
          return N("arg",{type:"ident",name}) 
        } 

    ident_lit "ident"  
      =  word:WORD { 
        return N( "literal", { type:"ident", value: word  } )
      }

  //\\ string
    string 
      = string_arg
      / string_lit
    string_arg 
      = name:arg_name {
          return N( "arg", { type:"string",name } ) 
        }
    string_lit 
      = template_lit
      / string_json_lit 
      / ident_lit

    template 
      = template_arg 
      / template_lit
    
    template_arg 
      = name:arg_name {
          return N( "arg", { type:"template",name } ) 
        }

    template_lit "string" 
      = '"' parts:template_part* '"' {
        return N( "literal", { type:"template",parts } )
      }

    template_part 
      = template_chars
      / template_expand

    template_chars "chars" 
      = chars:(!template_expand  @char)+ {
          return N( "template_chars", { chars:chars.join('') } )
        }

    template_expand "expansion" 
      = "{" name:arg_name "}" {
          return N( "template_expand", { name } )
        }

  //\\ string_json
    string_json 
      = string_json_arg
      / string_json_lit

    string_json_arg 
      = name:arg_name {
          return N( "arg", { type:"string_json",name } ) 
        }
    string_json_lit "string"
      = "'" value:value "'" { 
        return N( "literal", { type:"string_json", value: value  } )
        } 

    char
      = unescaped
      / escape sequence:(
            '"'
          / "\\"
          / "/"
          / "b" { return "\b"; }
          / "f" { return "\f"; }
          / "n" { return "\n"; }
          / "r" { return "\r"; }
          / "t" { return "\t"; }
          / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
              return String.fromCharCode(parseInt(digits, 16));
            }
        )
        { return sequence; }

    escape
      = "\\"
    
    quotation_mark
      = '"'

    unescaped
      = [^\0-\x1F\x22\x5C]



//\\ TOKENS
  COMMA = _ "," _
  EQUALS = _ "=" _

  DIGIT  = [0-9]
  HEXDIG = [0-9a-f]i
  WORD = $([A-Z_]i [A-Z0-9_]i*)
  IDENT "identifier" = WORD

  _ = WS*
  __ = [ \t]+
  WS "whitespace" = [ \n\t\r]
  EOL = __? [\n]
