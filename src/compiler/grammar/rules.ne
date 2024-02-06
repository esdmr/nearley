# nearley grammar
@{%
	import {type EbnfModifier, EbnfSymbol, MacroParameterSymbol, MacroCallSymbol, SubExpressionSymbol, insensitive} from '../symbol.js';
	import {Expression, Production, RawSourceCode, Include, Config, MacroDefinition} from '../ast.js';
%}

@nearley "../../runtime/index.js"

final -> _ prog _ %ws:? {% ([, a]) => a %}

prog -> prod
prog -> prog ws prod {% ([a, _b, c]) => [...a, c] %}

prod -> word _ %arrow _ expression+ {% d => new Production(d[0], d[4]) %}
prod -> word "[" _ wordlist _ "]" _ %arrow _ expression+ {% d => new MacroDefinition(d[0], d[3], d[9]) %}
prod -> "@" _ js {% ([_a, _b, c]) => c %}
prod -> "@" word ws word {% d => new Config(d[1], d[3]) %}
prod -> "@" word ws string {% d => new Config(d[1], d[3].value) %}
prod -> "@" word ws js {% d => new Config(d[1], d[3].source) %}
prod -> "@include" _ string {% ([_a, _b, {value}]) => new Include(value) %}

expression+ -> completeexpression
expression+ -> expression+ _ "|" _ completeexpression {% d => [...d[0], d[4]] %}

expressionlist -> completeexpression
expressionlist -> expressionlist _ "," _ completeexpression {% d => [...d[0], d[4]] %}

wordlist -> word
wordlist -> wordlist _ "," _ word {% d => [...d[0], d[4]] %}

completeexpression -> expr {% ([a]) => new Expression(a) %}
completeexpression -> expr _ js {% ([a, _b, c]) => new Expression(a, c) %}

expr_member -> %word {% ([i]) => new nearley.NonterminalSymbol(String(i)) %}
expr_member -> %keyword_null {% nearley.ignore %}
expr_member -> "$" word {% ([, a]) => new MacroParameterSymbol(a) %}
expr_member -> word "[" _ expressionlist _ "]" {% d => new MacroCallSymbol(d[0], d[3]) %}
expr_member -> string "i":? {% ([a, b]) => b ? insensitive(a) : a %}
expr_member -> "%" word {% ([, a]) => new nearley.TokenSymbol(a) %}
expr_member -> %charclass {% ([a]) => new nearley.RegExpSymbol(new RegExp(String(a), 'u')) %}
expr_member -> "(" _ expression+ _ ")" {% ([_a, _b, c]) => new SubExpressionSymbol(c) %}
expr_member -> expr_member _ ebnf_modifier {% ([a, _b, c]) => new EbnfSymbol(a, c) %}

ebnf_modifier -> ":+" {% (_): EbnfModifier => '+' %}
ebnf_modifier -> ":*" {% (_): EbnfModifier => '*' %}
ebnf_modifier -> ":?" {% (_): EbnfModifier => '?' %}

expr -> expr_member
expr -> expr ws expr_member {% ([a, _b, c]) => [...a, c] %}

word -> %word {% ([i]) => String(i) %}
word -> %keyword_null {% ([i]) => String(i) %}

string -> %string {% ([a]) => new nearley.LiteralSymbol(String(a)) %}
string -> %btstring {% ([a]) => new nearley.LiteralSymbol(String(a)) %}

js -> %js {% ([a]) => new RawSourceCode(String(a)) %}

_ -> ws:? {% nearley.ignore %}
ws -> %ws {% nearley.ignore %}
ws -> %ws:? %comment _ {% nearley.ignore %}
