{
  const _N = options.N || (($,props,location) => ({$,...props}));
  const N = ($,props) => { 
    const loc = location();
    const node = _N($,props,loc)
    if(!loc) debugger;
    return node;
  }
}


file = ___ head:DeclareNamespace tail:(EOL @DeclareNamespace)* ___ {
  return N('file',{namespaces:[head,...tail]})
}
//\\ globals
  DeclareNamespace 
    = "namespace" __ ns:IDENT EOL globals:globals {
        return N('DeclareNamespace',{ns,globals})
      }

  globals 
    = head:global tail:(EOL @global)* {
        return [head,...tail]
      }

  global 
    = DeclareFunction
    / DeclareMacro
    / Statement

  

//\\ macro

  DeclareMacro = "macro" __ name:NAME_OR_DIE args:macro_args statements:Braces {
      return N('DeclareMacro', { name,args,statements } )
  }

  arg_name 'macro argument'
    = "?" @WORD

  //\\ macro_args
    macro_args = _ "(" ___ head:macro_arg tail:(COMMA @macro_arg)* ___ ")" {
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

    call_arg_numbered = ___ value:macro_arg_literal  {
      return value
    } / & (COMMA)

    call_args_named = head:call_arg_named tail:(COMMA @call_arg_named)* {
      return [head,...tail]
    }

    call_arg_named = name:arg_name EQUALS value:macro_arg_literal {
      return {name,value}
    }


//\\ assign
  assign 'assignment'
    = assign_arg
    / assign_scoreboard 
    / assign_datapath 
    / assign_bossbar
    / assign_execute
    / delete_datapath 

  declare "declaration"
    = declare_var
    / declare_score


  assign_arg = name:arg_name EQUALS value:value {
    return N('assign_arg',{name,value})
  }

  assign_success
    = left:assign_store _ "?=" _ right:assign_run {
      return N('assign_success',{left,right}) 
    }

  assign_execute
    = left:assign_store right:assign_run {
        return N('assign_execute',{left,right}) 
      }

  assign_store 
    = id: scoreboard_id EQUALS {
        return N('assign_store_scoreboard',{id})
      }
    / path: datapath EQUALS scale:(@number _"*" _ )? {
        return N('assign_store_datapath',{path,scale})
      }
    / "bossbar" __ id:resloc __ prop:("value"/"max"/"visible") EQUALS {
        return N('assign_store_bossbar',{id,prop})
      }


  assign_run 
    = id: scoreboard_id {
        return N('assign_run_scoreboard',{id})
      }
    / path: datapath {
        return N('assign_run_datapath',{path})
      }
    / "bossbar" __ id:resloc __ prop:("value"/"max"/"visible") {
        return N('assign_run_bossbar',{id, prop})
      }
    / "test" __ conds:Conditionals {
        return N('assign_run_test',{id, conds})
    }
    / statement:Instruction {
        return N('assign_run_statement',{statement})
      }

//\\ print
  print = "print" selector:(__ @selector)? __ line:raw_line {
    return N('print',{selector,line})
  }

 //\\ commands

  command = "/" command:command_parts {
    return N('command', { command  } )
  }

  command_parts
      = parts:command_part* {
          return N('template_parts',{parts})
        }

    command_part
      = template_expand
      / command_chars

    command_chars  
      = chars:(![\n\r] @command_char)+ {
          return N('template_chars', { chars:chars.join('') } )
        }

  command_char 
    	= ![{] @char
      / @"{" ![.?$@(]
      / "\\" @.
    
  cmd 
    = "summon" pos:(_ @Position)? __ type:resloc_mc nbt:(@object)? then:(__ "then" __ @CodeBlock )? {
        return N('cmd_summon', { pos,type,nbt, then } )
      }
    / "give" __ selector:selector __ type:resloc_mc nbt:(@object)? {
        return N('cmd_give', { selector,type,nbt } )
      }
    / "setblock" pos:(_ @Position)? __ block:block_spec {
        return N('cmd_setblock', { pos, block } )
      }
    / "after" __ time:untyped_float unit:[tds]? __ fn:cmd_arg_function {
        return N('cmd_after', { time, unit: (unit ?? "t"), fn } )
      } 
    / "bossbar" __ "add" __ id:resloc __ name:string? {
        return N('bossbar_add', { id, name} )
      }
    / "bossbar" __ "remove" __ id:resloc {
        return N('bossbar_remove', { id } )
    } 
    / "tag" __ selector:selector __ tag:tag_id  {
        return N('tag_set',{selector,tag})
      }
    / "untag" __ selector:selector __ tag:tag_id  {
        return N('tag_unset',{selector,tag})
      }
    / "tag" __ name:string {
        return N('declare_tag',{name})
      }
    / "say" __ parts:command_parts {
      return N('cmd_say',{parts})
    }

  builtin
   =  "import" __ file:string {
      return N('import',{file})
    } / print
    


//\\ call
  function_call 
    = !RESERVED resloc:resloc_or_tag _ OPEN _ CLOSE {
      return N('function_call', { resloc } )
    }

  

//\\ execute


  
  OPEN = _ "(" ___
  CLOSE =  ___ ")"
  BEGIN = _ "{" ___
  END =  ___ "}"
  
  mod_arg_axes 
    = OPEN @("xyz"/"xy"/"xz"/"yz"/"x"/"y"/"z") CLOSE
    / __ @("xyz"/"xy"/"xz"/"yz"/"x"/"y"/"z")
  
  mod_arg_anchor 
    = OPEN @("eyes"/"feet") CLOSE
    / __ @("eyes"/"feet")
    
  mod_arg_selector 
    = OPEN @selector CLOSE
    / __ @selector
  
  mod_arg_test 
    = OPEN @test CLOSE
    / __ @test
  
  mod_arg_resloc 
    = OPEN @resloc CLOSE
    / __ @resloc
  
  dir_number = @untyped_float !"deg"
  rot_angle = @untyped_float "deg"
  
  mod_arg_number
  	= OPEN @dir_number CLOSE
    / __ @dir_number
    
  mod_arg_angle
  	= OPEN @rot_angle CLOSE
    / __ @rot_angle
    
  cmd_arg_function
    = AnonFunction
    / function_call
//\\ selector
  selector 
    = OPEN @_selector CLOSE
    / _selector

  _selector 'selector'
    = sort:selector_sort? "@" !"@" initial:(selector_initial/selector_initial_type) conditions:conditions {
      return N('selector', { initial,conditions:[...sort||[],...conditions] } )
    }
    
  //\\ sort
    selector_sort 
    = sort:sort_name limit:(__ @number) ? __ {
      if (!limit) return [N('cond_brackets_lit',{name:"sort",op:"include",value:sort})]
      return [
        N('cond_brackets_lit',{name:"sort",op:"include",value:sort}),
        N('cond_brackets',{name:"limit",op:"include",value:limit}),
      ]
    }
    
  //\\ initial
    selector_initial
    = initial:[a-z] ![a-z0-9_]i {
      if (!initial.match(/[prase]/)) expected("@p, @r, @a, @s, @e or @<type>")
      return N('selector_initial', { initial } )
    }

    selector_initial_type
    = type:resloc_or_tag_mc {
      return N('selector_initial_type', { type } )
    }

  //\\ conditions
    conditions = parts:condition_part* {
      return parts.flat()
    }

    condition_part = condition_tag/condition_brackets/condition_nbt

    condition_tag "selector tag"
    = "." value:tag_id { return [N('cond_brackets', { name:"tag", op:"include", value }) ]  }
    / "!" value:tag_id  { return [N('cond_brackets', { name:"tag", op:"exclude", value }) ]   }

    condition_nbt "selector nbt"
      = value:object {
        return N('cond_brackets_nbt', {name:"nbt",op:"include",value} )
      }

    condition_brackets "selector brackets"
      = "[" ___ 
        head:cond_brackets 
        tail:(COMMA @cond_brackets)* 
        ___ "]" {
        return [head,...tail]
    }
    
    cond_brackets  
      =   node: 
          (	 ($("d"? [xyz])     cond_op number )
          /  (( "type" )        cond_op resloc_or_tag_mc )
          /  (( "predicate" )   cond_op resloc )
          /  (( "limit")        cond_op int)
          /  (( "scores")       cond_op cond_brackets_scores)
          /  (( "advancements") cond_op cond_brackets_advancements)
          )
        {
          const [name,op,value] = node;
          return N('cond_brackets', {name,op,value} )
        } 
      /  node:
         ( ("sort"         cond_op sort_name)
         / ("gamemode"     cond_op gamemode)
         ) {
            const [name,op,value] = node;
            return N('cond_brackets_lit', {name,op,value} ) 
         }
      /  node:(( "tag" / "team" / "name") cond_op string? ) {
          const [name,op,value] = node;
          return N('cond_brackets', {name,op,value} )
        } 
      / node:(( "nbt") cond_op object ) {
          const [name,op,value] = node;
          return N('cond_brackets_nbt', {name,op,value} )
        }
      / name:"level" _ value:int_range_match {
          return N('cond_brackets', {name,op:"include",value} )
        }
      / name:("distance"/"x_rotation"/"y_rotation") _ value:range_match {
          return N('cond_brackets', {name,op:"include",value} )
      } 
      / "->" _ name:score_objective _ value:int_range_match {
          return N('cond_brackets_score', {name,op:"score",value} )
      }
    


    cond_op
      = _ "==" _ { return "include" }
      / _ ("=!"/"!=") _ { return "exclude" }
      / _ "=" _ { return "include" }

    cond_brackets_scores 
      = BEGIN 
        head: cond_brackets_score 
        tail: (COMMA @cond_brackets_score)*
        END {
          return N('cond_brackets_braces', {items: [head, ...tail]})
        }

    cond_brackets_score
      = name:ident EQUALS value:range {
          return N('cond_brackets_pair', {name,value})
        }

    cond_brackets_advancements 
      = BEGIN 
        head: cond_brackets_advancement
        tail: (COMMA @cond_brackets_advancement)*
        END {
          return N('cond_brackets_braces', {items: [head, ...tail]})
        }

    cond_brackets_advancement
      = name:resloc_mc EQUALS value:bool {
          return N('cond_brackets_pair', {name,value})
        }
      / BEGIN 
        head: cond_brackets_advancement_criterion
        tail: (COMMA @cond_brackets_advancement_criterion)*
        END {
          return N('cond_brackets_braces', {items: [head, ...tail]})
        }

    cond_brackets_advancement_criterion
      = name:ident EQUALS value:bool {
          return N('cond_brackets_pair', {name,value})
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


  

//\\ if_else
  
  //\\ test
    test = test_predicate/test_entity/test_datapath/test_scoreboard/test_block

    test_predicate = "predicate" __ predicate:resloc {
      return N('test_predicate', { predicate } )
    }
    

    test_entity = selector:selector {
      return N('test_entity', { selector } )
    }
    
    test_block 
      = pos:Coords __ spec:block_spec {
          return N('test_block_pos', { pos, spec } )
      }
      / spec:block_spec {
        return N('test_block', { spec } )
      } 
    


//\\ bossbar
  //\\ bossbar assign
  assign_bossbar
    = "bossbar" __ id:resloc __ 
    assign:(
        prop:("name"/"style"/"color") EQUALS value:string {
          return N('assign_bossbar_set', { prop, value } )
        }
      / prop:"players" EQUALS value:selector {
          return N('assign_bossbar_set', { prop, value } )
        }
      / prop:("max"/"value") EQUALS value:int {
          return N('assign_bossbar_set', { prop, value } )
        }  
      / prop:("visible") EQUALS value:bool {
          return N('assign_bossbar_set', { prop, value } )
        }  
    ) {
      assign.id = id;
      return assign;
    }

  bossbar_id 
    = name:resloc {
      return N('bossbar_id',{name})
    }
//\\ tag
    
  tag_id 
    = name:string {
      return N('tag_id',{name})
    }

  //\\ asign_tag
    //\\ assign_scoreboard
    assign_tag
      = selector:selector "." tag:tag_id EQUALS right:bool {
      		return N('assign_tag_value', { selector, tag, right } )
      	}
          

//\\ scoreboard
  var_name "variable"
    = "$" @IDENT 
  var_id
    = name:var_name {
      return N('var_id',{name});
    }
  constant_id 
    = value:int {
      return N('constant_id',{value});
    }
  score_id 
    = holder:score_holder _ "->" _ id:score_objective {
      return N( 'score_id', { holder,id } )
    }

  score_objective 'score objective'
    = string

  score_holder 
    = selector 
    
  scoreboard_id 
    = var_id 
    / constant_id 
    / score_id

  declare_var 
    = "var" __ name:var_name value:(EQUALS @number)? {
        return N('declare_var',{name,value})
      }
 
  declare_score 
    = "score" __ name:IDENT {
      return N('declare_score',{name,criterion:"dummy"})
    }
  
  
  //\\ assign_scoreboard
    assign_scoreboard
      = left:scoreboard_lhand _ 
          assign: (
            "=" _ right: number {
              return N('assign_scoreboard_value', { right } )
            }
          / op:"+=" _ right:int {
              return N('assign_scoreboard_add', { right } )
            }
          / op:"-=" _ right:int {
              return N('assign_scoreboard_remove', { right } )
            }
          / op:assign_scoreboard_op _ right:scoreboard_id {
              return N('assign_scoreboard_operation', { op, right } )
            }
          / op:("><"/"<=>") _ right:scoreboard_lhand {
              return N('assign_scoreboard_operation', { op:"><", right } )
            }
          / "++" {
              return N('assign_scoreboard_inc',{})
            }
          / "--" {
              return N('assign_scoreboard_dec',{})
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
      / ("<=" / "<") { return "<" }
      / (">=" / ">") { return ">" }
      


  //\\ test_scoreboard
    test_scoreboard
      = left:scoreboard_id _ right:int_range_match {
          return N('test_scoreboard_range',{left,right})
        }
      / left:scoreboard_id _ op:test_scoreboard_op _ right:scoreboard_id {
          return N('test_scoreboard',{left,op,right})
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
      = head:datahead "::" path:nbt_path {
          return N('datapath', { head, path } )
        } 
      / datapath_var

    datahead 
      = datahead_entity
      / datahead_storage

    datahead_entity 
      = selector:selector {
          return N('datahead_entity', { selector } )
        }

    datahead_storage 
      ="@@" name:resloc {
          return N('datahead_storage', { name } )
        }

    datahead_block 
      =position:Position {
          return N('datahead_block', { position } )
        }
    datapath_var 
      = "@@" path:nbt_path { return N('datapath_var', { path } ) }

  //\\ nbt_path
    nbt_path = head:nbt_path_head tail:nbt_path_tail* {
      return N('nbt_path',{path:[head,...tail]})
    }

    nbt_path_head 
        = nbt_path_root
        / nbt_path_match
        / nbt_path_bracket

    nbt_path_tail 
      = @nbt_path_member 
        / nbt_path_bracket

    nbt_path_root 
    = member:nbt_path_step {
        return N('nbt_path_root',member)
      }


    nbt_path_member 
      = "." member:nbt_path_step {
        return N('nbt_path_member',member)
      }

    nbt_path_step = name:string match:nbt_path_match? {
      return {name,match}
    }


    nbt_path_part
      = "{}"
        / nbt_path_ident
        / nbt_path_match
        / nbt_path_bracket
        

    nbt_path_bracket 
      = nbt_path_list_match
        / nbt_path_list
        / nbt_path_list_element

    nbt_path_list_element
      = "[" index:int "]" {
          return N('nbt_path_list_element',{index})
        }

    nbt_path_list
      = "[]" {
          return N('nbt_path_list')
        }


    nbt_path_list_match 
      = "[" match:object "]" {
          return N('nbt_path_list_match',{match})
        } 

    nbt_path_match = match:object_lit {
        return N('nbt_path_match',{match})
      }

    nbt_path_ident = string

  //\\ assign_datapath
    assign_datapath 
      = modify:("merge"/"append"/"prepend") __ left:datapath __ right:datapath {
          return N('datapath_modify_datapath',{modify,left,right})
        }
      /  modify:("merge"/"append"/"prepend") __ left:datapath __ right:value {
          return N('datapath_modify_value',{modify,left,right})
        }
      / modify:"append" __ left:datapath __ scale:(_ @number _ "*" _)? right:assign_run {
          return N('datapath_modify_execute',{modify,left,right,index:-1, scale})
        }
      / modify:"prepend" __ left:datapath __ scale:(_ @number _ "*" _)? right:assign_run {
          return N('datapath_modify_execute',{modify,left,right,index:0, scale})
        }
      / left:datapath EQUALS  right:value !(_ "*") {
          return N('datapath_modify_value', {modify: 'set', left, right } )
        }
      / left:datapath EQUALS  right:datapath  {
          return N('datapath_modify_datapath', {modify: 'set', left, right } )
        }

 

    delete_datapath 
      = ("delete"/"remove") __ path:datapath {
        return N('delete_datapath', { path } )
      }
  //\\ test_datapath
    test_datapath = path:datapath {
        return N('test_datapath', { path } )
      } 

//\\ block_spec

  block_spec 'block predicate'
    = resloc:resloc_or_tag_mc states:block_states? nbt:(@object)? {
        return N('block_spec',{resloc,states,nbt})
      }

  block_states 
    = "[" ___ head:block_state tail:( COMMA @block_state)* ___ "]" {
        return N('block_states',{states:[head,...tail]})
      }
  block_state 
    = name:ident EQUALS value:(number/string) {
        return N('block_state',{name,value})
      } 


//\\ parts
  
  resloc
    = resloc_full
    / name: ident {
        return N('resloc', { name } )
      }

  resloc_full 
  	= ns:ident ":" name:ident {
        return N('resloc', { ns,name } )
      }

  resloc_or_tag 
    = restag 
    / resloc

  resloc_mc
    = resloc_full
    / name: ident {
        return N('resloc_mc', { name } )
      }

  restag
    = restag_full
    / "#" name:ident {
        return N('restag', { name } )
      }

  restag_full 
  	= "#" ns:ident ":" name:ident {
        return N('restag', { ns,name } )
      }

  restag_mc
    = restag_full
    / "#" name: ident {
        return N('resloc_mc', { name } )
      }

  resloc_or_tag_mc
    = restag_mc
    / resloc_mc

  int_range_match
    = "=" "="? _ @int_range 
    / "<=" _ to:int { return N('range_to', { to }) }
    / ">=" _ from:int { return N('range_from', { from }) }
    / "<" _ to:int { return N('range_lt_int', { to }) }
    / ">" _ from:int { return N('range_gt_int', { from }) }

  int_range 
    = from:int ".." to:int { return N('range', { from,to } ) }
    / ".." to:int { return N('range_to', { to } ) }
    / from:int ".." { return N('range_from', { from } ) }
    / int

  range_match
    = "=" "="? _ @range 
    / "<=" _ to:number { return N('range_to', { to }) }
    / ">=" _ from:number { return N('range_from', { from }) }
    / "<" _ to:number { return N('range_lt', { to }) }
    / ">" _ from:number { return N('range_gt', { from }) }
    
  range 
    = from:number ".." to:number { return N('range', { from,to } ) }
    / ".." to:number { return N('range_to', { to } ) }
    / from:number ".." { return N('range_from', { from } ) }
    / number

  json 
    = json:value {
        return N('json', { json } )
      }
    /*
      JSON_text
        = _ value:value _ { return value; }
    */

//\\ values
  value
    = value_arg
    / value_lit

  value_arg
    = name:arg_name {
        return N('arg', { type:"value",name } )
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
    bool_arg
      = name:arg_name {
          return N('arg', { type:"bool",name } )
        }

    bool_lit
      = "true" { return N('boolean_lit', { type:"bool", value: true  } ) }
      / "false" { return N('boolean_lit', { type:"bool", value: false  } ) }

  //\\ object
    object 
      = object_arg
      / object_lit
    
    object_arg
      = name:arg_name { 
          return N('arg', { type:"object",name } ) 
        }


    object_lit
      = BEGIN
        members:(
          head:member tail:(COMMA @member)* COMMA? {
            return [head,...tail];
          }
        )?
        END
        { return N('object_lit', { type:"object",members:members||[] } ) }
    member
      = name:(string) _":" ___ value:value {
          return { name: name, value: value };
        }


  //\\ array
    array 
      = array_arg
      / array_lit

    array_arg 
      = name:arg_name {	return N('arg', { type:"array",name } ) }

    array_lit
      = "[" ___
        items:(
          head:value
          tail:(COMMA @value )*
          COMMA?
          { return [head].concat(tail); }
        )?
        ___ "]"
        { return N('array_lit', { type:"array", items: items || [] } ) }
  
  //\\ number
    number 
      = name:arg_name {	
          return N('arg', { type:"number",name } ) 
        }
      / number_lit

    number_lit 
      = float_lit
      / int_lit

    
    int 
      = name:arg_name {	
          return N('arg', { type:"int",name } ) 
        }
      / int_lit

    int_lit  "integer"
      = value:INT suffix:[bsli]? {
          return N('number_lit', { type:"int",value:+value,suffix } )
        }

    float  
      = name:arg_name {	
          return N('arg', { type:"float",name } ) 
        }
      / float_lit

    untyped_float  
      = name:arg_name {	
          return N('arg', { type:"float",name } ) 
        }
      / untyped_float_lit

    float_lit
      = typed_float_lit

    typed_float_lit 
      = value:FLOAT suffix:[fd]? {
          return N('number_lit', { type:"float",value:+value,suffix:suffix||"f" } )
        } 
      / value:INT suffix:[fd] {
          return N('number_lit', { type:"float",value:+value,suffix } )
        }
        
    untyped_float_lit
      = value:(FLOAT/INT) {
          return N('number_lit', { type:"float",value:+value } )
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
          return N('arg',{type:"ident",name}) 
        } 

    ident_lit   
      =  word:WORD { 
        return N('string_lit', { type:"ident", value: word  } )
      }

  //\\ string
    string 
      = string_arg
      / string_lit
      
    string_arg 
      = name:arg_name {
          return N('arg', { type:"string",name } ) 
        }
    string_lit 
      = template_lit
      / string_json_lit 
      / ident_lit
      / raw_text_lit

    template 
      = template_arg 
      / template_lit
    
    template_arg 
      = name:arg_name {
          return N('arg', { type:"template",name } ) 
        }


    template_lit  
      = '"' parts:template_part* '"' {
        return N('template_lit', { type:"template", parts } )
      }

    template_parts 
      = parts:template_part* {
          return N('template_parts',{parts})
        }

    template_part 
      = template_expand
      / template_chars

    template_expand
      = template_expand_arg
      / template_expand_var
      / template_expand_tag
      / template_expand_score
      / template_expand_score_id
      / template_expand_selector
      / template_expand_coords

    template_chars  
      = chars:(@template_char)+ {
          return N('template_chars', { chars:chars.join('') } )
        }
    
    template_sep  
      = chars:[{}] {
          return N('template_chars', { chars } )
        }

	  template_char 
    	= ![{}"] @char
      / "\\" @.
        
    template_expand_arg  
      = "{?" name:template_parts "}" {
          return N('template_expand_arg', { name } )
        }
    
    template_expand_tag  
      = "{." name:template_parts "}" {
          return N('template_expand_tag', { name } )
        }

    template_expand_var  
      = "{$" name:template_parts "}" {
          return N('template_expand_var', { name } )
        }
    
    template_expand_score  
      = "{->" name:template_parts "}" {
          return N('template_expand_score', { name } )
        }
    template_expand_score_id  
      = "{" id:score_id "}" {
          return N('template_expand_score_id', { id } )
        }
        
    template_expand_selector
      = "{" &"@" selector:(@selector/&{expected('selector')}) "}" {
          return N('template_expand_selector', { selector } )
        }
	
      template_expand_coords
      = "{" &"(" coords:(@Position/&{expected('coordinates')}) "}" {
          return N('template_expand_coords', { coords } )
        }
    
  //\\ string_json
    string_json 
      = string_json_arg
      / string_json_lit

    string_json_arg 
      = name:arg_name {
          return N('arg', { type:"string_json",name } ) 
        }
    string_json_lit 
      = "json" __ value:value { 
        return N('string_json', { type:"string_json", value: value  } )
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
      = [^\0-\x1F\\]

LT = "<" _
LTS = "</" _
GT = ___ ">"
SGT = ___ "/>"

	raw_text 
      = raw_text_arg
      / raw_text_lit
      
    raw_text_lit
      = raw_tag

    raw_text_arg 
      = name:arg_name {
          return N('arg', { type:"raw_text",name } ) 
        }
    

raw_tag 
  = open:raw_tag_open ___ GT
    ___
  	parts:raw_part*
    ___
    close:(
      tag:raw_tag_close {
      	if(tag == open.tag) return tag;
        expected("</"+open.tag+">",)
      }
    ) { 
    	open.parts = parts;
      return open;
    }
  / @raw_tag_open SGT 

raw_tag_open
  = /*LT attr:(head:raw_attr tail:(___ @raw_attr)* { return [head,...tail] }) &(GT/SGT) {
  	const tag = N("raw_tag",{props:{}})
  	tag.attr = attr;
    return tag;	
    }
  / */
  !LTS LT tag:(raw_tag_name/ident:ident? &{error("expected valid tag name, but "+ident+" found",)})  attr:(___ @raw_attr)* {
  	tag.attr = attr;
    return tag;
	}

  raw_attr = name:ident EQUALS value:value {
    return {name,value}
  }

raw_tag_close
  = LTS @WORD GT

raw_line = parts:(raw_tag/raw_expand/raw_chars)* {
  return N('raw_line',{parts})
}

raw_part 
  = raw_tag 
  / raw_expand 
  /  chars:$(EOL) {
      return N('raw_chars_ws',{chars})
    }
  /  raw_chars

 raw_chars = chars:$(!(LT) (raw_char))+ {
    return N('raw_chars',{chars})
  }

 raw_char 
  = ![{] @char
  / @"{" ![.?$@(]
  / "\\" @.
 raw_expand
  = template_expand_arg
  / raw_expand_var
  / raw_expand_score_id
  / template_expand_tag
  / template_expand_score
  / template_expand_selector
  / template_expand_coords
  
  raw_expand_var  
    = "{$" name:template_parts "}" {
        return N('raw_expand_var', { name } )
      }
  
  raw_expand_score_id  
    = "{" holder:score_holder _ "->" _ id:score_objective "}" {
        return N('raw_expand_score_id', { holder, id } )
      }

raw_tag_name "raw tag"
	=  tag:( "black" 
      / "dark_blue"
      / "dark_green"
      / "dark_aqua"
      / "dark_red" 
      / "dark_purple" 
      / "gold" 
      / "gray" 
      / "dark_gray"
      / "blue" 
      / "green" 
      / "aqua" 
      / "red" 
      / "light_purple"
      / "yellow"
      / "white"
      / "reset"
      ) {
      	return N("raw_tag",{tag,props:{color:tag}})
      }
    / tag:("div"/"d") {
        return N("raw_tag",{tag,props:{},block:true})
      } 
    / tag:("p") {
        return N("raw_tag",{tag,props:{},block:true,paragraph:true})
      } 
    /  tag:("h") {
        return N("raw_tag",{tag,props:{bold:true},block:true,paragraph:true})
      } 
    / tag:("span"/"t") {
    	  return N("raw_tag",{tag,props:{}})
      } 
    / tag:"b" {
        return N("raw_tag",{tag,props:{bold:true}})
      } 
    / tag:"i" {
        return N("raw_tag",{tag,props:{italic:true}})
      } 
    / tag:"u" {
        return N("raw_tag",{tag,props:{underlined:true}})
      }
    / tag:"s" {
        return N("raw_tag",{tag,props:{strike_through:true}})
      }


//\\ TOKENS
  COMMA = ___ "," ___
  EQUALS = _ "=" _

  DIGIT  = [0-9]
  HEXDIG = [0-9a-f]i
  WORD_INIT = [A-Z_]i
  WORD_CHAR = [A-Z0-9_]i
  WORD = $(WORD_INIT WORD_CHAR*)
  IDENT  = WORD

  _ 'whitespace' = SPACE*
  __ 'whitespace' = SPACE+
  ___ 'whitespace' = WS*
  SPACE = [ \t]
  WS  
    = [ \n\t\r]
    / EOL_COMMENT
  EOL 'end of line' = __? [\n\r]+ ___ / EOL_COMMENT

EOL_COMMENT 
  = _ "//" [^\n\r]* [\n\r]+ ___ 

NAME_OR_DIE 
  = NAME
  / word:WORD &{ error(word +' is a reserved word')}

NAME 
  = !RESERVED @WORD

RESERVED 
  = (KEYWORD / COMMAND / MOD / SELECTOR) ![a-z-_]i

KEYWORD 
  = "namespace" / "function" / "macro"
  / "var" / "score" / "delete" / "remove" 
  / "true" / "false" / "json"

COMMAND 
  = "print" / "give" / "setblock" / "after" / "tag" / "untag"

MOD 
  = "align" / "anchored" / "as" / "at" / "for" / "in"
  / "up" / "down" / "north" / "south" / "east" / "west" / "left" / "right" 
  / "pos" / "positioned" / "rot" / "rotated" 
  / "if" / "unless" / "else" / "then"
  / "eyes" / "feet" / "deg"


SELECTOR
  =  "sort" / "limit" / "tag" / "nbt" / "type" / "predicate" / "distance" 
  / "level" / "team" / "name" / "gamemode" / "scores" / "advancements" 
  / "nearest" / "closest" / "furthest" 
  / "arbitrary" / "oldest" / "any" / "random" 

// POSITION AND COORDINATES

  Position 
    = OPEN @Coords CLOSE / NativeCoords
  
  Coords 
    = RelativeCoords 
    / LocalCoords 
    / NativeCoords
  
  RelativeCoords
    = head: RelativeCoord tail:(__ @RelativeCoord)* {
      return N("RelativeCoords",{ _coords: [head, ...tail]} )
    }
    
  RelativeCoord
    = "east"  __ d:Coord { return { axis:'x', f:+1, d } }
    / "west"  __ d:Coord { return { axis:'x', f:-1, d } }
    / "up"    __ d:Coord { return { axis:'y', f:+1, d } }
    / "down"  __ d:Coord { return { axis:'y', f:-1, d } }
    / "south" __ d:Coord { return { axis:'z', f:+1, d } }
    / "north" __ d:Coord { return { axis:'z', f:-1, d } }
  
  LocalCoords
    = head: LocalCoord tail:(__ @LocalCoord)* {
      return N("LocalCoords",{ _coords: [head, ...tail]} )
    }

  LocalCoord
    = "left"        __ d:Coord { return { axis:'x', f:+1, d } }
    / "right"       __ d:Coord { return { axis:'x', f:-1, d } }
    / "upward"      __ d:Coord { return { axis:'y', f:+1, d } }
    / "downward"    __ d:Coord { return { axis:'y', f:-1, d } }
    / "forward"     __ d:Coord { return { axis:'z', f:+1, d } }
    / "back""ward"? __ d:Coord { return { axis:'z', f:-1, d } }

  NativeCoords
    = NativeLocalCoords
    / NativeWorldCoords
  
  NativeWorldCoords 
    = x: NativeCoord __ y: NativeCoord  __ z: NativeCoord {
        return N("NativeCoords",{x,y,z})
      }
      
  NativeCoord 
    = TildeCoord 
    / Coord

  NativeLocalCoords 
    = x: CaretCoord __ y: CaretCoord  __ z: CaretCoord {
         return N("NativeCoords",{x,y,z} )
      }
  
  Rotation 
    = OPEN @Angles CLOSE / NativeAngles
  

  Angles
  	= NativeAngles / RelativeAngles
    
  NativeAngles
  	= x:NativeCoord "deg"? __ y:NativeCoord "deg"? {
      return N("NativeAngles",{x,y} )
   }
  
  RelativeAngles
  	= head: RelativeAngle tail:(__ @RelativeAngles)* {
      return N("RelativeAngles",{ _coords: [head, ...tail]} )
    } 
  
  RelativeAngle
    = "left"        __ d:Angle { return { axis:'x', f:+1, d } }
    / "right"       __ d:Angle { return { axis:'x', f:-1, d } }
    / "up" 		      __ d:Angle { return { axis:'y', f:+1, d } }
    / "down"    	  __ d:Angle { return { axis:'y', f:-1, d } }
    

  Coord 
    = untyped_float

  Angle 
    = @untyped_float "deg"

  TildeCoord 
    = "~" arg:Coord?  {
        return N('TildeCoord',{arg})
      }

  CaretCoord 
    = "^" arg:Coord  {
        return N('CaretCoord',{arg})
      }
      



/*---------------------------------------------------------------------*/
  Statements = head:Statement tail:(EOL @Statement)* {
  	return [head,...tail]
  }
  Declaration = declare 
  Instruction = Structure / assign / command / cmd / builtin / CallSelf / function_call / MacroCall 
  Executable = last:(CodeBlock / (__ @Instruction)) {
      return N( 'Executable', { last } )
  }
  Execution 
    = modifiers:Modifiers executable:Executable {
      return N( 'Execution', { modifiers, executable } )
  }
  Modifiers 
    = head:Modifier tail:(__ @Modifier)* {
      return [head,...tail]
    }
  Statement = statement:(
    Declaration / Instruction / Execution / BlockArg
  ) {
    statement.text = text();
    return statement;
  }
  CodeBlock = BEGIN statements:Statements END {
      return N( 'CodeBlock', { statements } )
  }
  AnonFunction = BEGIN statements:Statements END {
      return N( 'AnonFunction', { statements } )
  }
  StatementOrBlock 
    = CodeBlock
    / Statement
  
  Braces = BEGIN @statements:Statements END 
  Modifier  
  = MOD:"align" ARG:mod_arg_axes {
      return N( 'ModifierNativeLiteral', { MOD, ARG } )
    }
  / MOD:"anchored" ARG:mod_arg_anchor {
      return N( 'ModifierNativeLiteral', { MOD, ARG } )
    }
  / MOD:
    ( "as"
    / "at"
    / "pos" "itioned?" __ "as" { return "positioned as" }
    / "rot" "ated?" __ "as" { return "rotated as" }
    ) arg:mod_arg_selector {
    return N( 'ModifierNative', { MOD, arg } )
  }
  / "for" arg:mod_arg_selector {
      return N( 'ModifierFor', { arg } )
  }
  / MOD:"in" arg:mod_arg_resloc {
    return N( 'ModifierNative', { MOD, arg } )
  }
  / "pos" "itioned"? _ arg:Position {
    return N( 'ModifierNative', { MOD:"positioned", arg } )
  }
  / "rot" "ated"? _ arg:Rotation {
    return N( 'ModifierNative', { MOD:"rotated", arg } )
  }
  / arg:RelativeAngles {
    return N('ModifierNative', { MOD:"rotated", arg} )
  }
  / arg:RelativeCoords {
    return N('ModifierNative', { MOD:"positioned", arg } )
  }
  / arg:LocalCoords {
    return N('ModifierNative', { MOD:"positioned", arg } )
  }
  
  Structure 
    = arg:Conditionals then:Executable 
        otherwise:(__ "else" @Executable)? {
        return N('StructureIfElse', { arg, then, otherwise } )
      }
    / "repeat" mods:(__ @mods:Modifiers)? 
      statements:Braces? 
      __ conds:LoopConditionals 
      then:(__ "then" @Executable)? {
        return N('StructureRepeat',{mods,statements,conds,then})
      }

    / "every" __ time:untyped_float unit:[tds]? 
      statements:Braces 
      __ conds:LoopConditionals 
      then:(__ "then" @Executable)?{
      return N('every_until',{statements,conds,time,unit,then})
    }

  Conditionals
  = head:Conditional tail:(__ "and" __ @Conditional)* {
    return N("Conditionals",{subs:[head,...tail]})
  } 

  Conditional
  = "if" arg:mod_arg_test {
    return N("ConditionalIf",{arg})
  } 
  / "unless" arg:mod_arg_test {
    return N("ConditionalUnless",{arg})
  } 

  LoopConditionals
  = head:LoopConditional tail:(__ "and" __ @LoopConditional)* {
    return N("Conditionals",{subs:[head,...tail]})
  } 

  LoopConditional
  = "while" arg:mod_arg_test {
    return N("ConditionalIf",{arg})
  } 
  / "until" arg:mod_arg_test {
    return N("ConditionalUnless",{arg})
  } 

/*
   /  "repeat" __ mods:mods? _ statements:Braces conds:(__ @repeat_cond)+ then:(__ "then" @Braces)? {
     return N('repeat_until',{mods,statements,conds,then})
   } 
   
*/


  MacroCall
    = name:NAME _ OPEN args:call_args CLOSE 
      then:(__ "then" __ @StatementOrBlock)? 
      otherwise:(__ "else" __ @StatementOrBlock)? {
        return N('macro_call', { name, args, then, otherwise } )
      }
  BlockArg
    = "{{" _ "then" _ "}}" {
        return N("BlockArgThen")
      }
    / "{{" _ "else" _ "}}" {
        return N("BlockArgElse")
      }

  CallSelf = "self" _ "(" _ ")" {
    return N('CallSelf', {} )
  }

  DeclareFunction 
    = "function" __ name:NAME_OR_DIE tags:(__ @restag)* (_ OPEN CLOSE _)? statements:Braces {
        return N('DeclareFunction', { name,tags,statements } )
    }