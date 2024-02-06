// Generated automatically by nearley, version 3.0.3
// https://github.com/esdmr/nearley (fork of https://github.com/Hardmath123/nearley)
import * as nearley from "../../runtime/index.js";

	import {lexer} from './lexer.js';


	import {type EbnfModifier, EbnfSymbol, MacroParameterSymbol, MacroCallSymbol, SubExpressionSymbol, insensitive} from '../symbol.js';
	import {Expression, Production, RawSourceCode, Include, Config, MacroDefinition} from '../ast.js';

export default new nearley.Grammar([
	new nearley.Rule("final$1", [new nearley.TokenSymbol("ws")], nearley.id),
	new nearley.Rule("final$1", [], nearley.ignore),
	new nearley.Rule("final", [new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("prog"), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("final$1")], ([, a]) => a),
	new nearley.Rule("prog", [new nearley.NonterminalSymbol("prod")]),
	new nearley.Rule("prog", [new nearley.NonterminalSymbol("prog"), new nearley.NonterminalSymbol("ws"), new nearley.NonterminalSymbol("prod")], ([a, _b, c]) => [...a, c]),
	new nearley.Rule("prod", [new nearley.NonterminalSymbol("word"), new nearley.NonterminalSymbol("_"), new nearley.TokenSymbol("arrow"), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("expression+")], d => new Production(d[0], d[4])),
	new nearley.Rule("prod", [new nearley.NonterminalSymbol("word"), new nearley.LiteralSymbol("["), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("wordlist"), new nearley.NonterminalSymbol("_"), new nearley.LiteralSymbol("]"), new nearley.NonterminalSymbol("_"), new nearley.TokenSymbol("arrow"), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("expression+")], d => new MacroDefinition(d[0], d[3], d[9])),
	new nearley.Rule("prod", [new nearley.LiteralSymbol("@"), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("js")], ([_a, _b, c]) => c),
	new nearley.Rule("prod", [new nearley.LiteralSymbol("@"), new nearley.NonterminalSymbol("word"), new nearley.NonterminalSymbol("ws"), new nearley.NonterminalSymbol("word")], d => new Config(d[1], d[3])),
	new nearley.Rule("prod", [new nearley.LiteralSymbol("@"), new nearley.NonterminalSymbol("word"), new nearley.NonterminalSymbol("ws"), new nearley.NonterminalSymbol("string")], d => new Config(d[1], d[3].value)),
	new nearley.Rule("prod", [new nearley.LiteralSymbol("@"), new nearley.NonterminalSymbol("word"), new nearley.NonterminalSymbol("ws"), new nearley.NonterminalSymbol("js")], d => new Config(d[1], d[3].source)),
	new nearley.Rule("prod", [new nearley.LiteralSymbol("@include"), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("string")], ([_a, _b, {value}]) => new Include(value)),
	new nearley.Rule("expression+", [new nearley.NonterminalSymbol("completeexpression")]),
	new nearley.Rule("expression+", [new nearley.NonterminalSymbol("expression+"), new nearley.NonterminalSymbol("_"), new nearley.LiteralSymbol("|"), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("completeexpression")], d => [...d[0], d[4]]),
	new nearley.Rule("expressionlist", [new nearley.NonterminalSymbol("completeexpression")]),
	new nearley.Rule("expressionlist", [new nearley.NonterminalSymbol("expressionlist"), new nearley.NonterminalSymbol("_"), new nearley.LiteralSymbol(","), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("completeexpression")], d => [...d[0], d[4]]),
	new nearley.Rule("wordlist", [new nearley.NonterminalSymbol("word")]),
	new nearley.Rule("wordlist", [new nearley.NonterminalSymbol("wordlist"), new nearley.NonterminalSymbol("_"), new nearley.LiteralSymbol(","), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("word")], d => [...d[0], d[4]]),
	new nearley.Rule("completeexpression", [new nearley.NonterminalSymbol("expr")], ([a]) => new Expression(a)),
	new nearley.Rule("completeexpression", [new nearley.NonterminalSymbol("expr"), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("js")], ([a, _b, c]) => new Expression(a, c)),
	new nearley.Rule("expr_member", [new nearley.TokenSymbol("word")], ([i]) => new nearley.NonterminalSymbol(String(i))),
	new nearley.Rule("expr_member", [new nearley.TokenSymbol("keyword_null")], nearley.ignore),
	new nearley.Rule("expr_member", [new nearley.LiteralSymbol("$"), new nearley.NonterminalSymbol("word")], ([, a]) => new MacroParameterSymbol(a)),
	new nearley.Rule("expr_member", [new nearley.NonterminalSymbol("word"), new nearley.LiteralSymbol("["), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("expressionlist"), new nearley.NonterminalSymbol("_"), new nearley.LiteralSymbol("]")], d => new MacroCallSymbol(d[0], d[3])),
	new nearley.Rule("expr_member$1", [new nearley.LiteralSymbol("i")], nearley.id),
	new nearley.Rule("expr_member$1", [], nearley.ignore),
	new nearley.Rule("expr_member", [new nearley.NonterminalSymbol("string"), new nearley.NonterminalSymbol("expr_member$1")], ([a, b]) => b ? insensitive(a) : a),
	new nearley.Rule("expr_member", [new nearley.LiteralSymbol("%"), new nearley.NonterminalSymbol("word")], ([, a]) => new nearley.TokenSymbol(a)),
	new nearley.Rule("expr_member", [new nearley.TokenSymbol("charclass")], ([a]) => new nearley.RegExpSymbol(new RegExp(String(a), 'u'))),
	new nearley.Rule("expr_member", [new nearley.LiteralSymbol("("), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("expression+"), new nearley.NonterminalSymbol("_"), new nearley.LiteralSymbol(")")], ([_a, _b, c]) => new SubExpressionSymbol(c)),
	new nearley.Rule("expr_member", [new nearley.NonterminalSymbol("expr_member"), new nearley.NonterminalSymbol("_"), new nearley.NonterminalSymbol("ebnf_modifier")], ([a, _b, c]) => new EbnfSymbol(a, c)),
	new nearley.Rule("ebnf_modifier", [new nearley.LiteralSymbol(":+")], (_): EbnfModifier => '+'),
	new nearley.Rule("ebnf_modifier", [new nearley.LiteralSymbol(":*")], (_): EbnfModifier => '*'),
	new nearley.Rule("ebnf_modifier", [new nearley.LiteralSymbol(":?")], (_): EbnfModifier => '?'),
	new nearley.Rule("expr", [new nearley.NonterminalSymbol("expr_member")]),
	new nearley.Rule("expr", [new nearley.NonterminalSymbol("expr"), new nearley.NonterminalSymbol("ws"), new nearley.NonterminalSymbol("expr_member")], ([a, _b, c]) => [...a, c]),
	new nearley.Rule("word", [new nearley.TokenSymbol("word")], ([i]) => String(i)),
	new nearley.Rule("word", [new nearley.TokenSymbol("keyword_null")], ([i]) => String(i)),
	new nearley.Rule("string", [new nearley.TokenSymbol("string")], ([a]) => new nearley.LiteralSymbol(String(a))),
	new nearley.Rule("string", [new nearley.TokenSymbol("btstring")], ([a]) => new nearley.LiteralSymbol(String(a))),
	new nearley.Rule("js", [new nearley.TokenSymbol("js")], ([a]) => new RawSourceCode(String(a))),
	new nearley.Rule("_$1", [new nearley.NonterminalSymbol("ws")], nearley.id),
	new nearley.Rule("_$1", [], nearley.ignore),
	new nearley.Rule("_", [new nearley.NonterminalSymbol("_$1")], nearley.ignore),
	new nearley.Rule("ws", [new nearley.TokenSymbol("ws")], nearley.ignore),
	new nearley.Rule("ws", [new nearley.NonterminalSymbol("final$1"), new nearley.TokenSymbol("comment"), new nearley.NonterminalSymbol("_")], nearley.ignore)
], "final", lexer);
