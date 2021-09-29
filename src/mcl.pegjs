


source = node:file {
  return node;
}

file = _ globals:globals _{
  return {$:'file',globals}
}

globals = head:global tail:_global* {
	return [head,...tail]
}

global = namespace/function/macro
_global = [ \t]* [\n] _ global:global {
  return global;
}

namespace = "namespace" __ ns:IDENT {
  return {$:"namespace",ns}
}

function = "function" __ name:IDENT _ "{" _ statements:statements _ "}" {
    return {$:"function",name,statements}
}

macro = "macro" __ name:IDENT args:macro_args _ "{" _ statements:statements _ "}" {
    return {$:"macro",name,args,statements}
}

macro_args = _ "(" _ head:macro_arg tail:(_ ","_ @macro_arg)* _ ")" {
	return [head,...tail]
}

macro_arg = name:arg def:macro_arg_default? {
	return {name,def}
}

macro_arg_default = _ "=" _ @macro_arg_literal

macro_arg_literal = value

call_args 
= numbered:call_args_numbered named:(_"," _ @call_args_named)? {
	return {numbered,named:named||{}}
}
/ named:call_args_named {
   return {numbered:[],named}
}

call_args_numbered = head:call_arg_numbered tail:(_ ","_ @call_arg_numbered)* {
	return [head,...tail]
}

call_arg_numbered = _ value:macro_arg_literal  {
	return value
} / & (_ ",")

call_args_named = head:call_arg_named tail:(_ ","_ @call_arg_named)* {
	return [head,...tail]
}

call_arg_named = name:arg _"=" _ value:macro_arg_literal {
  return {name,value}
}

statements = head:statement tail:_statement* {
	return [head,...tail]
}

//statement = call/selector

statement = command/cmd/execute/call/assign/if_else
_statement = [ \t]* [\n] _ statement:statement {
  return statement;
}

cmd = cmd_give

cmd_give = "give" __ selector:selector __ type:string nbt:(_ @object)? {
  return {$:"cmd_give",selector,type,nbt}
}

command = _ "/" command:$([^\n]+) {
	return {$:"command",command }
}

call = name:IDENT _ "(" _ ")" {
  return {$:"call",name}
}
/ name:IDENT _ "(" _ args:call_args _ ")" {
  return {$:"macro_call",name,args}
}

execute = mods:mods _ code:code {
  return {$:"execute",mods,code}
}
mods = head:mod tail:_mod * {
  return [head,...tail]
}
_mod = __ mod:mod {
  return mod;
}
mod 
= "align" __ axes:("xyz"/"xy"/"xz"/"yz"/"x"/"y"/"z") {
  return {$:'mod_align',axes}
}
/ "anchored" __ anchor:("eyes"/"feet") {
  return {$:'mod_align',axes}
}
/ "as" __ selector:selector {
  return {$:'mod_as',selector}
}
/ "at" __ selector:selector {
  return {$:'mod_at',selector}
}
/ "for" __ selector:selector {
  return {$:'mod_for',selector}
}
/ "in" __ dimension:resloc {
  return {$:'mod_in',dimension}
}
/ "pos" "itioned"? __ "as" __ selector:selector {
  return {$:'mod_pos_as',selector}
} 
/ "pos" "itioned"? __ pos:pos_any {
  return {$:'mod_pos',pos}
}
/ head:mod_dir tail:_mod_dir* {
  return {$:"mod_dir",mods:[head,...tail]}
}
/ "if" __ test:test ! (_ code else) {
  return {$:"mod_if",test}
} 
/ "unless" __ test:test {
  return {$:"mod_unless",test}
}

else = _ "else" __ @code

if_else = "if" __ test:test _ code:code _else:else {
  return {$:"if_else",test,code,_else}
}

test = test_entity/test_datapath

test_entity = selector:selector {
  return {$:"test_entity",selector}
} 

test_datapath = path:datapath {
  return {$:"test_datapath",path}
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
  return {$:"pos_abs",x,y,z}
}

pos_rel
= "(" _ x:NUMBER __ y:NUMBER __ z:NUMBER _ ")" {
  return {$:"pos_rel",x,y,z}
}

pos_from
= "<" _ x:NUMBER __ y:NUMBER __ z:NUMBER _ ">" {
  return {$:"pos_from",x,y,z}
}

coord_abs 
= "~" number:NUMBER {
  return "~"+number
} / NUMBER

code 
= "{" _ statements:statements _ "}" { 
  if (statements.length===1) return statements[0]
  return {$:'code',statements:statements} 
}
/ statement


selector = sort:selector_sort? "@" head:(initial/initial_type) conditions:conditions {
	return {$:"selector",head,conditions:[...sort||[],...conditions]}
}

selector_sort 
= sort:("nearest"/"random"/"furthest"/"arbitrary") limit:selector_limit? __ {
  if (!limit) return [{$:'cond',name:"sort",op:"=",value:sort}]
  return [
    {$:'cond',name:"sort",op:"=",value:sort},
    {$:'cond',name:"limit",op:"=",value:limit},
  ]
}

selector_limit = __ @number

initial
= initial:[a-z] ![a-z0-9_]i {
	return {$:"initial",initial}
}

initial_type
= type:resloc {
	return {$:"initial_type",type}
}

conditions = parts:condition_part* {
  return parts.flat()
}

condition_part = condition_tag/condition_brackets

condition_tag 
= "." value:string { return [{$:"cond",name:"tag", op:"=", value }] }
/ "!" value:string { return [{$:"cond",name:"tag", op:"=!", value }] }

condition_brackets = "[" _ head:condition tail:(_"," _ @condition)* _ "]" {
	return [head,...tail]
}

condition = cond_number/cond_json/cond_resloc/cond_range

cond_number = name:cond_number_name op:cond_op value:NUMBER {
  return {$:"cond",name, op, value }
}
cond_number_name = "x" / "y" / "z" / "dx" / "dy" / "dz"

cond_json = name:cond_json_name op:cond_op value:json {
  return {$:"cond",name, op, value }
}
cond_json_name = "nbt"

cond_resloc = name:cond_resloc_name op:cond_op value:resloc {
  return {$:"cond",name, op, value }
}

cond_range = name:cond_range_name op:cond_op value:range {
  return {$:"cond",name, op, value }
}
cond_range_name = "distance"

cond_resloc_name = "tag" / "type"

range 
= from:NUMBER _ ".." to:NUMBER { return {$:"range",from,to}}
/ ".." to:NUMBER { return {$:"range_to",to}}
/ from:NUMBER _ ".."{ return {$:"range",from}}
/ NUMBER

resloc
= ns:ident_arg ":" name:ident_arg {
	return {$:"resloc",ns,name}
}
/ name: ident_arg {
	return {$:"resloc",name}
}

cond_op
= _ op:$("=" "!"?) _ { return op }

assign = assign_score / assign_datapath / delete_datapath

assign_score = left:score _ "=" _ right:assign_score_rhand {
  return {left,...right}
}

assign_score_rhand
= right:number {
  return {$:"assign_score_value",right}
}
/ right:score {
  return {$:"assign_score_score",right}
}
/ right:datapath {
  return {$:"assign_score_datapath",right}
}
/ right:statement {
  return {$:"assign_score_statement",right}
}

assign_datapath = left:datapath _ "=" _ right:assign_datapath_rhand {
  return {left,...right}
}

assign_datapath_rhand
= right:value {
  return {$:"assign_datapath_value",right}
}
/ right:score {
  return {$:"assign_datapath_score",right}
}
/ right:datapath {
  return {$:"assign_datapath_datapath",right}
}
/ right:statement {
  return {$:"assign_datapath_statement",right}
}

delete_datapath = ("delete"/"remove") __ path:datapath {
  return {$:"delete_datapath",path}
}

score = holder:holder _ "->" _ id:ident {
  return {$:'score',holder,id}
}

holder = selector / ident

datapath = head:datahead "::" steps:steps {
  return {$:"datapath",head,steps}
} / datapath_var

datahead = datahead_entity/datahead_storage

datahead_storage ="$" name:resloc {
  return {$:"datahead_storage",name}
}

datapath_var = "$" steps:steps {
  return {$:"datapath_var",steps } 
}


datahead_entity = selector:selector {
  return {$:"datahead_entity",selector}
}

steps = head:step tail:("." @step)* { return [head,...tail] }

step= json/IDENT

json = json:JSON_text {
  return {$:"json",json}
}

NUMBER = chars:$( [-+]? [0-9]+ ( "." [0-9]+ / "b" )?) {
	return chars;
}

arg = "?" name:IDENT {
	return name;
}

ident_arg 
= name:arg { return {$:"arg",type:"ident",name} } / ident

ident = ident:IDENT { return {$:"ident",ident} } 

IDENT "identifier" = $([a-zA-Z0-9_]+)

_ = WS*
__ = WS+
WS "whitespace" = [ \n\t\r]


JSON_text
  = _ value:value _ { return value; }

// ----- 3. Values -----

value = value_arg/value_lit
value_arg "value argument"
= name:arg_name {
	return {$:"arg",type:"value",name}
}

value_lit
  = bool
  / object
  / array
  / number
  / string

bool = bool_arg/bool_lit
bool_arg "bool argument"
= name:arg_name {
	return {$:"arg",type:"bool",name}
}

bool_lit
  = "true" { return {$:"literal",type:"bool", value: true } }
  / "false" { return {$:"literal",type:"bool", value: false } }
    
// ----- 4. Objects -----

object = object_arg/object_lit
object_arg "object argument"
= name:arg_name {
	return {$:"arg",type:"object",name}
}


object_lit
  = _ "{" _
    members:(
      head:member
      tail:(_ "," _ @member)*
      {
        return [head,...tail];
      }
    )?
    _ "}"_
    { return {$:"literal",type:"object",members:members||[]} }

member
  = name:(string) _":"_ value:value {
      return { name: name, value: value };
    }

// ----- 5. Arrays -----


array = array_arg/array_lit
array_arg = name:arg_name {	return {$:"arg",type:"array",name} }

array_lit
  = "["_
    items:(
      head:value
      tail:(_","_ @value )*
      { return [head].concat(tail); }
    )?
    _"]"
    { return {$:"literal",type:"array", items: items || []} }

// ----- 6. Numbers -----

number = number_arg/number_lit
number_arg = name:arg_name {	return {$:"arg",type:"number",name} }
number_lit = float_lit/int_lit

int = int_arg/int_lit
int_arg = name:arg_name {	return {$:"arg",type:"int",name} }
int_lit "integer" = value:INT suffix:[bsli]? {
  return {$:"literal",type:"int",value:+value,suffix}
}

float "float" = float_arg/float_lit
float_arg = name:arg_name {	return {$:"arg",type:"float",name} }
float_lit = value:FLOAT suffix:[fd]? {
  return {$:"literal",type:"float",value:+value,suffix}
} /  value:INT suffix:[fd] {
  return {$:"literal",type:"float",value:+value,suffix}
}

FLOAT
  = value:$(INT (FRAC EXP?/EXP)) { return +value }

EXP
  = [eE] ([-+])? [0-9]+

FRAC
  = "." [0-9]+

INT
  = value: $([+-]? ("0"/[1-9][0-9]*)) { return +value }

// ----- 7. Strings -----



template = template_arg/template_lit
template_arg = name:arg_name {return {$:"arg",type:"template",name}}

template_lit "string" = '"' parts:template_part* '"' {
  return {$:"literal",type:"template",parts}
}

template_part = template_chars/template_expand

template_chars "chars" = chars:(!template_expand  @char)+ {
  return {$:"template_chars",chars:chars.join('')}
}

template_expand "expansion" = "{" name:arg_name "}" {
  return {$:"template_expand",name}
}

string = string_arg/string_lit
string_arg = name:arg_name {return {$:"arg",type:"string",name}}
string_lit = template_lit/string_json_lit/ident_lit

string_json = string_json_arg/string_json_lit
string_json_arg = name:arg_name {return {$:"arg",type:"string_json",name}}

string_json_lit "string"
= "'" value:value "'" { 
	return { $:"literal", type:"string_json", value: value }
} 
ident_lit "ident"  =  word:WORD { 
	return {$:"literal", type:"ident", value: word }
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

arg_name = "?" @WORD

// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i
WORD = $([A-Z_]i [A-Z0-9_]i*)