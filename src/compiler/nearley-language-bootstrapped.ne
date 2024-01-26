# nearley grammar
@{%
	import {EbnfSymbol, MacroParameterSymbol, MacroCallSymbol, SubExpressionSymbol} from './symbol.js';
	import {Expression, Production, RawSourceCode, Include, Config, MacroDefinition} from './ast.js';

	function getValue([{value}]: [nearley.lexer.Token]) {
		return value;
	}

	function literals(list: string[]) {
		return Object.fromEntries(list.map(i => [i, {match: i, next: 'main'}]));
	}

	const rules = Object.assign(
		{
			ws: {match: /\s+/u, lineBreaks: true, next: 'main'},
			comment: /#.*/u,
			arrow: {match: /[=-]+>/u, next: 'main'},
			js: {
				match: /\{%(?:[^%]|%[^}])*%\}/u,
				value: (x: string) => x.slice(2, -2),
				lineBreaks: true,
			},
			word: {
				match: /[\w?+]+/u,
				next: 'afterWord',
				type: nearley.lexer.keywords({
					keyword_null: 'null',
				}),
			},
			string: {
				match: /"(?:[^\\"\n]|\\["\\/bfnrt]|\\u[a-fA-F\d]{4})*"/u,
				value: (x: string) => JSON.parse(x),
				next: 'main',
			},
			btstring: {
				match: /`[^`]*`/u,
				value: (x: string) => x.slice(1, -1),
				next: 'main',
				lineBreaks: true,
			},
		},
		literals([
			',',
			'|',
			'$',
			'%',
			'(',
			')',
			':?',
			':*',
			':+',
			'@include',
			'@',
			']',
		]),
	);

	const lexer = nearley.lexer.states({
		main: {
			...rules,
			charclass: {
				match: /\.|\[(?:\\.|[^\\\n])+?\]/u,
			},
		},
		// Both macro arguments and charclasses are both enclosed in [ ].
		// We disambiguate based on whether the previous token was a `word`.
		afterWord: {
			...rules,
			'[': {match: '[', next: 'main'},
		},
	});

	function insensitive({value}: nearley.lexer.Token) {
		const result = [];

		for (const c of value) {
			if (c.toUpperCase() !== c || c.toLowerCase() !== c) {
				result.push(new RegExp(`[${c.toLowerCase()}${c.toUpperCase()}]`, 'u'));
			} else {
				result.push(new nearley.LiteralSymbol(c));
			}
		}

		return new SubExpressionSymbol([new Expression(result, 'joiner')]);
	}
%}

@lexer lexer
@nearley "../runtime/index.js"
@preprocessor ts

final -> _ prog _ %ws:? {% ([, a]) => a %}

prog -> prod
prog -> prod ws prog {% ([a, _b, c]) => [a, ...c] %}

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

expr_member -> %word {% getValue %}
expr_member -> %keyword_null {% () => '' %}
expr_member -> "$" word {% ([, a]) => new MacroParameterSymbol(a) %}
expr_member -> word "[" _ expressionlist _ "]" {% d => new MacroCallSymbol(d[0], d[3]) %}
expr_member -> string "i":? {% ([a, b]) => b ? insensitive(a) : a %}
expr_member -> "%" word {% ([, a]) => new nearley.TokenSymbol(a) %}
expr_member -> charclass {% nearley.id %}
expr_member -> "(" _ expression+ _ ")" {% ([_a, _b, c]) => new SubExpressionSymbol(c) %}
expr_member -> expr_member _ ebnf_modifier {% ([a, _b, c]) => new EbnfSymbol(a, c) %}

ebnf_modifier -> ":+" {% () => EbnfSymbol.plus %}
ebnf_modifier -> ":*" {% () => EbnfSymbol.star %}
ebnf_modifier -> ":?" {% () => EbnfSymbol.opt %}

expr -> expr_member
expr -> expr ws expr_member {% ([a, _b, c]) => [...a, c] %}

word -> %word {% getValue %}
word -> %keyword_null {% getValue %}

string -> %string {% ([{value}]) => new nearley.LiteralSymbol(value) %}
string -> %btstring {% ([{value}]) => new nearley.LiteralSymbol(value) %}

charclass -> %charclass {% ([a]) => new RegExp(a, 'u') %}

js -> %js {% ([{value}]) => new RawSourceCode(value) %}

_ -> ws:?
ws -> %ws
ws -> %ws:? %comment _
