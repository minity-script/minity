{
  const _N = options.N || (($,props,location) => ({$,...props}));
  const N = ($,props) => { 
    const loc = location();
    const node = _N($,props,loc)
    if(!loc) debugger;
    return node;
  }
}





file = ___ head:namespace tail:(EOL @namespace)* ___ {
  return N('file',{namespaces:[head,...tail]})
}
//\\ globals
  namespace 
    = "namespace" __ ns:IDENT EOL globals:globals {
        return N('namespace',{ns,globals})
      }

  globals 
    = head:global tail:(EOL @global)* {
        return [head,...tail]
      }

  global 
    = function
    / macro
    / statement

  function 
    = "function" __ name:NAME_OR_DIE tags:(__ @restag)* statements:braces {
        return N('function', { name,tags,statements } )
    }

//\\ macro

  macro = "macro" __ name:NAME_OR_DIE args:macro_args statements:braces {
      return N('macro', { name,args,statements } )
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


//\\ statements
  statements 
    = head:statement tail:(EOL @statement)* {
      return [head,...tail]
    }

  statement 
    = command
    / assign
    / cmd
    / builtin
    / declare
    / execute
    / if_else
    / print
    / function_call
    / macro_call

//\\ assign
  assign 'assignment'
    = assign_scoreboard 
    / assign_datapath 
    / assign_bossbar
    / assign_execute
    / delete_datapath 

  declare "declaration"
    = declare_var
    / declare_score

  assign_execute
    = left:assign_store EQUALS right:assign_run {
        return N('assign_execute',{left,right}) 
      }

  assign_store 
    = id: scoreboard_id {
        return N('assign_store_scoreboard',{id})
      }
    / path: datapath {
        return N('assign_store_datapath',{path})
      }
    / "bossbar" __ id:bossbar_id __ prop:("value"/"max"/"visible") {
        return N('assign_store_bossbar',{path})
      }

  assign_run 
    = id: scoreboard_id {
        return N('assign_run_scoreboard',{id})
      }
    / path: datapath {
        return N('assign_run_datapath',{path})
      }
    / "bossbar" __ id:bossbar_id __ prop:("value"/"max"/"visible") {
        return N('assign_run_bossbar',{path})
      }
    / statement:statement {
        return N('assign_run_statement',{statement})
      }

//\\ print
  print = "print" selector:(__ @selector)? __ parts:print_parts {
    return N('print',{selector,parts})
  }

  print_parts = head:print_part tail:(print_sep print_part)* {
    return [head,...tail].flat().filter(Boolean);
  }

  print_sep 
  =  __ { return N('print_space')}
  / __? "," __? { return false }

  print_part 
  = name:var_name { return N('print_var',{name})}
  / value:string { return N('print_string',{value})}
  / value:value { return N('print_value',{value})}

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
      / @"{" ![.?$]
      / "\\" @.
    
  cmd 
    = "summon" pos:(_ @pos_any)? __ type:resloc_mc nbt:("::" @object)? then:(__ "then" __ @code )? {
        return N('cmd_summon', { pos,type,nbt, then } )
      }
    / "give" __ selector:selector __ type:resloc_mc nbt:("::" @object)? {
        return N('cmd_give', { selector,type,nbt } )
      }
    / "setblock" pos:(_ @pos_any)? __ block:block_spec {
        return N('cmd_setblock', { pos, block } )
      }
    / "after" __ time:untyped_float unit:[tds]? __ fn:cmd_arg_function {
        return N('cmd_after', { time, unit: (unit ?? "t"), fn } )
      } 
    / "bossbar" __ "add" __ id:bossbar_id __ name:string? {
        return N('bossbar_add', { id, name} )
      }
    / "bossbar" __ "remove" __ id:bossbar_id {
        return N('bossbar_remove', { id } )
    } 

  repeat_cond
    = head: "until" test:mod_arg_test {
        return N( "repeat_cond_until", {head, test} )
      }
    / head: "while" test:mod_arg_test {
      return N( "repeat_cond_while", {head, test} )
    }
  builtin
   =  "import" __ file:string {
      return N('import',{file})
    } 
   /  "repeat" __ mods:mods? _ statements:braces conds:(__ @repeat_cond)+ then:(__ "then" @braces)? {
     return N('repeat_until',{mods,statements,conds,then})
   } 
   / "every" __ time:untyped_float unit:[tds]? statements:braces _ "until" test:mod_arg_test {
     return N('every_until',{statements,test,time,unit})
   }

   /  "tag" __ tag:tag_id __ selector:selector {
        return N('tag_set',{selector,tag})
      }
    / "untag" __ tag:tag_id __ selector:selector {
        return N('tag_unset',{selector,tag})
      }
    / "tag" __ name:string {
        return N('declare_tag',{name})
      }
    


//\\ call
  function_call 
    = !RESERVED resloc:resloc_or_tag _ OPEN _ CLOSE {
      return N('function_call', { resloc } )
    }

  macro_call
    = name:NAME _ OPEN args:call_args CLOSE {
        return N('macro_call', { name,args } )
      }

//\\ execute
  execute = mods:mods code:code {
    return N('execute', { mods,code } )
  }
  mods = head:mod tail:_mod * {
    return [head,...tail]
  }
  _mod = __ mod:mod {
    return mod;
  }
  
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
    
  mod 
  = "align" axes:mod_arg_axes {
      return N( 'mod_align', { axes } )
    }
  / "anchored" anchor:mod_arg_anchor {
      return N( 'mod_anchored', { anchor } )
    }
  / "as" selector:mod_arg_selector {
    return N( 'mod_as', { selector } )
  }
  / "at" selector:mod_arg_selector {
    return N( 'mod_at', { selector } )
  }
  / "for" selector:mod_arg_selector {
      return N( 'mod_for', { selector } )
  }
  / "in" dimension:mod_arg_resloc {
    return N( 'mod_in', { dimension } )
  }
  / "pos" "itioned"? __ "as" mod_arg_selector:selector {
    return N( 'mod_pos_as', { selector } )
  } 
  / "pos" "itioned"? _ pos:pos_any {
    return N( 'mod_pos', { pos } )
  }
  / "rot" "ated"? __ "as" mod_arg_selector:selector {
    return N( 'mod_rot_as', { selector } )
  } 
  / "rot" "ated"? _ rot:rot_any {
    return N( 'mod_rotated', { rot } )
  }
  / mods:mod_rots tail:(__ @mod_rot)* {
    return N('mod_rot', { mods } )
  }
  / mods:mod_dirs {
    return N('mod_dir', { mods } )
  }
  / "if" test:mod_arg_test !(code else) {
    return N('mod_if', { test } )
  } 
  / "unless" test:mod_arg_test  !(code else) {
    return N('mod_unless', { test } )
  }

  mod_dirs
    = head:mod_dir tail:(__ @mod_dir)* {
      return [head,...tail]
    }
  
  mod_dir 
    = direction:direction off:mod_arg_number {
      return {...direction,off}
    }
  
  direction 
    = "up"    { return {dir:"y",f: 1} }
    / "down"  { return {dir:"y",f:-1} }
    / "north" { return {dir:"z",f:-1} }
    / "south" { return {dir:"z",f: 1} }
    / "east"  { return {dir:"x",f: 1} }
    / "west"  { return {dir:"x",f: 1} }
    
	mod_rots
    = head:mod_rot tail:(__ @mod_rot)* {
      return [head,...tail]
    }
    
  	mod_rot 
    = direction:rot_direction off:mod_arg_angle {
      return {...direction,off}
    }
  
    rot_direction 
    = "up"    { return {dir:"y",f: 1} }
    / "down"  { return {dir:"y",f:-1} }
    / "left"  { return {dir:"x",f: 1} }
    / "right" { return {dir:"x",f:-1} }
      
    

  pos_any = pos_abs/pos_mod/pos_from
  coords_any = coords_abs / coords_mod

  pos_abs
  = OPEN @coords_abs CLOSE 

  coords_abs 
    = x:coord_abs __ y:coord_abs __ z:coord_abs {
      return N('pos_abs', { x,y,z } )
    }


  pos_from
  = "<" _ x:number __ y:number __ z:number _ ">" {
    return N('pos_from', { x,y,z } )
  }
  
  pos_mod
   = OPEN @coords_mod CLOSE 
  
  coords_mod
   = mods:mod_dirs {
   	return N('pos_mod', {mods} )
   }
  
  coord_abs 
  = "~" number:dir_number? {
    return N('tilde',{number:number||0})
  } / dir_number

  angle_abs 
  = "~" number:rot_angle? {
    return N('tilde',{number:number||0})
  } / rot_angle

  rot_any = rot_abs/rot_mod

  rot_abs
  = OPEN x:angle_abs __ y:angle_abs  CLOSE {
    return N('rot_abs', { x,y } )
  }
  
  rot_mod
   = OPEN mods:mod_rots CLOSE {
   	return N('rot_mod', {mods} )
   }
  

  braces 
    = BEGIN @statements END 

  code 
    = statements:code_braces {
      if (statements.length===1) return statements[0]
      return N( 'code', { statements:statements } )
    }
    / @code_statement

  code_braces  = ___ @braces
  code_statement  = __ @statement

  cmd_arg_function
    = BEGIN statements:statements END { 
      return N( 'code', { statements:statements } )
    }
    / function_call

//\\ selector
  selector 
    = OPEN @_selector CLOSE
    / _selector

  _selector 'selector'
    = sort:selector_sort? "@" !"@" head:(initial/initial_type) conditions:conditions {
      return N('selector', { head,conditions:[...sort||[],...conditions] } )
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
      return N('initial', { initial } )
    }

    initial_type
    = type:resloc_or_tag_mc {
      return N('initial_type', { type } )
    }

  //\\ conditions
    conditions = parts:condition_part* {
      return parts.flat()
    }

    condition_part = condition_tag/condition_brackets/condition_nbt

    condition_tag "selector tag"
    = "." value:tag_id { return [N('cond_brackets_noquotes', { name:"tag", op:"=", value }) ]  }
    / ".!" value:tag_id  { return [N('cond_brackets_noquotes', { name:"tag", op:"=!", value }) ]   }

    condition_nbt "selector nbt"
      = "::" value:object {
        return N('cond_brackets_nbt', {name:"nbt",op:"=",value} )
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
          (	 ($("d"? [xyz] / [xy] "_rotation") cond_op number )
          /  (( "type" ) cond_op resloc_or_tag_mc )
          /  (( "predicate" ) cond_op resloc )
          /  (( "distance" / "level") cond_op range )
          /  (( "sort")         cond_op sort_name )
          /  (( "limit")        cond_op int)
          /  (( "gamemode")     cond_op gamemode)
          /  (( "scores")       cond_op cond_brackets_scores)
          /  (( "advancements") cond_op cond_brackets_advancements)
          )
        {
          const [name,op,value] = node;
          return N('cond_brackets', {name,op,value} )
        } 
      / node:(( "tag" / "team" / "name") cond_op string? ) {
          const [name,op,value] = node;
          return N('cond_brackets_noquotes', {name,op,value} )
        } 
      / node:(( "nbt") cond_op object ) {
          const [name,op,value] = node;
          return N('cond_brackets_nbt', {name,op,value} )
        } 
          
    cond_op
      = _ @$("=" "!"?) _

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
  else = ___ "else" @code

  mod_checks
    = head:mod_check tail:(__ "and" __ @mod_check)* {
      return N("mod_checks",{checks:[head,...tail]})
    } 

  mod_check
    = "if" test:mod_arg_test {
      return N("mod_check_if",{test})
    } 
    / "unless" test:mod_arg_test {
      return N("mod_check_unless",{test})
    } 

  if_else = checks:mod_checks then_code:code else_code:else {
    return N('if_else', { checks, then_code, else_code } )
  }

  //\\ test
    test = test_predicate/test_datapath/test_entity/test_scoreboard/test_block

    test_predicate = "predicate" __ predicate:resloc {
      return N('test_predicate', { predicate } )
    }
    

    test_entity = selector:selector {
      return N('test_entity', { selector } )
    }
    
    test_block 
      = OPEN pos:coords_any? __ spec:block_spec {
          return N('test_block_pos', { pos, spec } )
      }
      / spec:block_spec {
        return N('test_block', { spec } )
      } 
    


//\\ bossbar
  //\\ bossbar assign
  assign_bossbar
    = "bossbar" __ id:bossbar_id __ 
    assign:(
        prop:("name"/"style"/"color") EQUALS value:string {
          return N('assign_bossbar_set', { prop, value } )
        }
      / prop:"players" EQUALS players:selector {
          return N('assign_bossbar_set', { prop, value } )
        }
      / prop:("max"/"value"/"visible") EQUALS value:int {
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
          / op:assign_scoreboard_op _ right:scoreboard_id {
              return N('assign_scoreboard_operation', { left, op, right } )
            }
          / op:("><"/"<=>") _ right:scoreboard_lhand {
              return N('assign_scoreboard_operation', { left, op, right } )
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
      = left:scoreboard_id _ op:test_scoreboard_op _ right:int {
          return N('test_scoreboard_value',{left,op,right})
        }
      / left:scoreboard_id _ op:test_scoreboard_op _ right:scoreboard_id {
          return N('test_scoreboard',{left,op,right})
        }
      / left:scoreboard_id {
        return N('test_scoreboard_true',{left})
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
      / modify:"append" __ left:datapath __ right:assign_run {
          return N('datapath_modify_execute',{modify,left,right,index:-1})
        }
      / modify:"prepend" __ left:datapath __ right:assign_run {
          return N('datapath_modify_execute',{modify,left,right,index:0})
        }
      / left:datapath EQUALS  right:value {
          return N('datapath_modify_value', {modify: 'set', left, right } )
        }
      / left:datapath EQUALS  right:datapath {
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
    = resloc:resloc_or_tag_mc states:block_states? nbt:("::" @object)? {
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
        return N('resloc', { name } )
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


  range 
    = from:number ".." to:number { return N('range', { from,to } ) }
    / ".." to:number { return N('range_to', { to } ) }
    / from:number ".." { return N('range', { from } ) }
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
          return N('number_lit', { type:"float",value:+value,suffix } )
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
      / template_expand_tag

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
  = open:raw_tag_open GT
  	parts:raw_tag_part*
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
  = LT attr:(head:raw_attr tail:(___ @raw_attr)* { return [head,...tail] }) &(GT/SGT) {
  	const tag = N("raw_tag",{props:{}})
  	tag.attr = attr;
    return tag;	
    }
  / LT tag:raw_tag_name attr:(___ @raw_attr)* &(GT/SGT) {
  	tag.attr = attr;
    return tag;
	}

raw_attr = name:string EQUALS value:value {
	return {name,value}
}

raw_tag_close
  = LTS @WORD? GT

raw_tag_part 
  = @raw_tag 
  / chars:$(!LT char/[\n\r\t])+ {
  	return N('raw_chars',{chars:chars.replace(/([ \t]*[\n\r][ \t]*)/g,"\n")})
  }
  

raw_tag_name 
	=  tag:"span" {
    	return N("raw_tag",{tag,props:{}})
    } / tag:"b" {
    	return N("raw_tag",{tag,props:{bold:true}})
    } / tag:"i" {
    	return N("raw_tag",{tag,props:{italic:true}})
    } / tag:"u" {
    	return N("raw_tag",{tag,props:{underlined:true}})
    } 
    / tag:( "black" 
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
