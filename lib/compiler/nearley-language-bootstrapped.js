// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// @ts-nocheck
import * as nearley from "#nearley";

    import {EbnfSymbol, MacroParameterSymbol, MacroCallSymbol, SubExpressionSymbol} from './symbol.js';
    import {Expression, Production, RawSourceCode, Include, Config, MacroDefinition} from './ast.js';

    function getValue([{value}]) {
        return value;
    }

    function literals(list) {
        const rules = {};
        for (const lit of list) {
            rules[lit] = {match: lit, next: 'main'};
        }

        return rules;
    }

    const rules = Object.assign(
        {
            ws: {match: /\s+/, lineBreaks: true, next: 'main'},
            comment: /#.*/,
            arrow: {match: /[=-]+>/, next: 'main'},
            js: {
                match: /\{\%(?:[^%]|%[^}])*\%\}/,
                value: (x) => x.slice(2, -2),
                lineBreaks: true,
            },
            word: {
                match: /[\w?+]+/,
                next: 'afterWord',
                type: nearley.lexer.keywords({
                    keyword_null: 'null',
                }),
            },
            string: {
                match: /"(?:[^\\"\n]|\\["\\/bfnrt]|\\u[a-fA-F\d]{4})*"/,
                value: (x) => JSON.parse(x),
                next: 'main',
            },
            btstring: {
                match: /`[^`]*`/,
                value: (x) => x.slice(1, -1),
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
        main: Object.assign({}, rules, {
            charclass: {
                match: /\.|\[(?:\\.|[^\\\n])+?]/,
            },
        }),
        // Both macro arguments and charclasses are both enclosed in [ ].
        // We disambiguate based on whether the previous token was a `word`.
        afterWord: Object.assign({}, rules, {
            '[': {match: '[', next: 'main'},
        }),
    });

    function insensitive({value}) {
        const result = [];
        for (let i = 0; i < value.length; i++) {
            const c = value.charAt(i);
            if (c.toUpperCase() !== c || c.toLowerCase() !== c) {
                result.push(new RegExp(`[${c.toLowerCase()}${c.toUpperCase()}]`));
            } else {
                result.push(new nearley.LiteralSymbol(c));
            }
        }

        return new SubExpressionSymbol([new Expression(result, 'joiner')]);
    }

export default new nearley.Grammar([
	new nearley.Rule("final$1", [new nearley.TokenSymbol("ws")], nearley.id),
	new nearley.Rule("final$1", [], (_) => undefined),
	new nearley.Rule("final", ["_", "prog", "_", "final$1"],  ([, a]) => a ),
	new nearley.Rule("prog", ["prod"]),
	new nearley.Rule("prog", ["prod", "ws", "prog"],  ([a, _b, c]) => [a, ...c] ),
	new nearley.Rule("prod", ["word", "_", new nearley.TokenSymbol("arrow"), "_", "expression+"],  d => new Production(d[0], d[4]) ),
	new nearley.Rule("prod", ["word", new nearley.LiteralSymbol("["), "_", "wordlist", "_", new nearley.LiteralSymbol("]"), "_", new nearley.TokenSymbol("arrow"), "_", "expression+"],  d => new MacroDefinition(d[0], d[3], d[9]) ),
	new nearley.Rule("prod", [new nearley.LiteralSymbol("@"), "_", "js"],  ([_a, _b, c]) => c ),
	new nearley.Rule("prod", [new nearley.LiteralSymbol("@"), "word", "ws", "word"],  d => new Config(d[1], d[3]) ),
	new nearley.Rule("prod", [new nearley.LiteralSymbol("@"), "word", "ws", "string"],  d => new Config(d[1], d[3].value) ),
	new nearley.Rule("prod", [new nearley.LiteralSymbol("@"), "word", "ws", "js"],  d => new Config(d[1], d[3].source) ),
	new nearley.Rule("prod", [new nearley.LiteralSymbol("@include"), "_", "string"],  ([_a, _b, {value}]) => new Include(value) ),
	new nearley.Rule("expression+", ["completeexpression"]),
	new nearley.Rule("expression+", ["expression+", "_", new nearley.LiteralSymbol("|"), "_", "completeexpression"],  d => [...d[0], d[4]] ),
	new nearley.Rule("expressionlist", ["completeexpression"]),
	new nearley.Rule("expressionlist", ["expressionlist", "_", new nearley.LiteralSymbol(","), "_", "completeexpression"],  d => [...d[0], d[4]] ),
	new nearley.Rule("wordlist", ["word"]),
	new nearley.Rule("wordlist", ["wordlist", "_", new nearley.LiteralSymbol(","), "_", "word"],  d => [...d[0], d[4]] ),
	new nearley.Rule("completeexpression", ["expr"],  ([a]) => new Expression(a) ),
	new nearley.Rule("completeexpression", ["expr", "_", "js"],  ([a, _b, c]) => new Expression(a, c) ),
	new nearley.Rule("expr_member", [new nearley.TokenSymbol("word")],  getValue ),
	new nearley.Rule("expr_member", [new nearley.TokenSymbol("keyword_null")],  () => '' ),
	new nearley.Rule("expr_member", [new nearley.LiteralSymbol("$"), "word"],  ([, a]) => new MacroParameterSymbol(a) ),
	new nearley.Rule("expr_member", ["word", new nearley.LiteralSymbol("["), "_", "expressionlist", "_", new nearley.LiteralSymbol("]")],  d => new MacroCallSymbol(d[0], d[3]) ),
	new nearley.Rule("expr_member$1", [new nearley.LiteralSymbol("i")], nearley.id),
	new nearley.Rule("expr_member$1", [], (_) => undefined),
	new nearley.Rule("expr_member", ["string", "expr_member$1"],  ([a, b]) => b ? insensitive(a) : a ),
	new nearley.Rule("expr_member", [new nearley.LiteralSymbol("%"), "word"],  ([, a]) => new nearley.TokenSymbol(a) ),
	new nearley.Rule("expr_member", ["charclass"],  nearley.id ),
	new nearley.Rule("expr_member", [new nearley.LiteralSymbol("("), "_", "expression+", "_", new nearley.LiteralSymbol(")")],  ([_a, _b, c]) => new SubExpressionSymbol(c) ),
	new nearley.Rule("expr_member", ["expr_member", "_", "ebnf_modifier"],  ([a, _b, c]) => new EbnfSymbol(a, c) ),
	new nearley.Rule("ebnf_modifier", [new nearley.LiteralSymbol(":+")],  () => EbnfSymbol.plus ),
	new nearley.Rule("ebnf_modifier", [new nearley.LiteralSymbol(":*")],  () => EbnfSymbol.star ),
	new nearley.Rule("ebnf_modifier", [new nearley.LiteralSymbol(":?")],  () => EbnfSymbol.opt ),
	new nearley.Rule("expr", ["expr_member"]),
	new nearley.Rule("expr", ["expr", "ws", "expr_member"],  ([a, _b, c]) => [...a, c] ),
	new nearley.Rule("word", [new nearley.TokenSymbol("word")],  getValue ),
	new nearley.Rule("word", [new nearley.TokenSymbol("keyword_null")],  getValue ),
	new nearley.Rule("string", [new nearley.TokenSymbol("string")],  ([{value}]) => new nearley.LiteralSymbol(value) ),
	new nearley.Rule("string", [new nearley.TokenSymbol("btstring")],  ([{value}]) => new nearley.LiteralSymbol(value) ),
	new nearley.Rule("charclass", [new nearley.TokenSymbol("charclass")],  ([a]) => new RegExp(a) ),
	new nearley.Rule("js", [new nearley.TokenSymbol("js")],  ([{value}]) => new RawSourceCode(value) ),
	new nearley.Rule("_$1", ["ws"], nearley.id),
	new nearley.Rule("_$1", [], (_) => undefined),
	new nearley.Rule("_", ["_$1"]),
	new nearley.Rule("ws", [new nearley.TokenSymbol("ws")]),
	new nearley.Rule("ws", ["final$1", new nearley.TokenSymbol("comment"), "_"])
], "final", lexer);
