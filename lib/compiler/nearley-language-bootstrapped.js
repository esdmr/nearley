// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }

    import moo from 'moo';

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
            word: {match: /[\w?+]+/, next: 'afterWord'},
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

    const lexer = moo.states({
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

    function insensitive({literal}) {
        const s = literal;
        const result = [];
        for (let i = 0; i < s.length; i++) {
            const c = s.charAt(i);
            if (c.toUpperCase() !== c || c.toLowerCase() !== c) {
                result.push(new RegExp(`[${c.toLowerCase()}${c.toUpperCase()}]`));
            } else {
                result.push({literal: c});
            }
        }

        return {subexpression: [{tokens: result, postprocess: (d) => d.join('')}]};
    }
const Lexer = lexer;
const ParserRules = [
    {"name": "final$e$1", "symbols": [({type: "ws"})], "postprocess": id},
    {"name": "final$e$1", "symbols": [], "postprocess": (_) => null},
    {"name": "final", "symbols": ["_", "prog", "_", "final$e$1"], "postprocess": ([, a]) => a},
    {"name": "prog", "symbols": ["prod"], "postprocess": ([a]) => [a]},
    {"name": "prog", "symbols": ["prod", "ws", "prog"], "postprocess": ([a, _b, c]) => [a, ...c]},
    {"name": "prod", "symbols": ["word", "_", ({type: "arrow"}), "_", "expression+"], "postprocess": d => ({name: d[0], rules: d[4]})},
    {"name": "prod", "symbols": ["word", {"literal":"["}, "_", "wordlist", "_", {"literal":"]"}, "_", ({type: "arrow"}), "_", "expression+"], "postprocess": d => ({macro: d[0], args: d[3], exprs: d[9]})},
    {"name": "prod", "symbols": [{"literal":"@"}, "_", "js"], "postprocess": ([_a, _b, c]) => ({body: c})},
    {"name": "prod", "symbols": [{"literal":"@"}, "word", "ws", "word"], "postprocess": d => ({config: d[1], value: d[3]})},
    {"name": "prod", "symbols": [{"literal":"@include"}, "_", "string"], "postprocess": ([_a, _b, {literal}]) => ({include: literal})},
    {"name": "expression+", "symbols": ["completeexpression"]},
    {"name": "expression+", "symbols": ["expression+", "_", {"literal":"|"}, "_", "completeexpression"], "postprocess": d => [...d[0], d[4]]},
    {"name": "expressionlist", "symbols": ["completeexpression"]},
    {"name": "expressionlist", "symbols": ["expressionlist", "_", {"literal":","}, "_", "completeexpression"], "postprocess": d => [...d[0], d[4]]},
    {"name": "wordlist", "symbols": ["word"]},
    {"name": "wordlist", "symbols": ["wordlist", "_", {"literal":","}, "_", "word"], "postprocess": d => [...d[0], d[4]]},
    {"name": "completeexpression", "symbols": ["expr"], "postprocess": ([a]) => ({tokens: a})},
    {"name": "completeexpression", "symbols": ["expr", "_", "js"], "postprocess": ([a, _b, c]) => ({tokens: a, postprocess: c})},
    {"name": "expr_member", "symbols": ["word"], "postprocess": id},
    {"name": "expr_member", "symbols": [{"literal":"$"}, "word"], "postprocess": ([, a]) => ({mixin: a})},
    {"name": "expr_member", "symbols": ["word", {"literal":"["}, "_", "expressionlist", "_", {"literal":"]"}], "postprocess": d => ({macrocall: d[0], args: d[3]})},
    {"name": "expr_member$e$1", "symbols": [{"literal":"i"}], "postprocess": id},
    {"name": "expr_member$e$1", "symbols": [], "postprocess": (_) => null},
    {"name": "expr_member", "symbols": ["string", "expr_member$e$1"], "postprocess": ([a, b]) => b ? insensitive(a) : a},
    {"name": "expr_member", "symbols": [{"literal":"%"}, "word"], "postprocess": ([, a]) => ({token: a})},
    {"name": "expr_member", "symbols": ["charclass"], "postprocess": id},
    {"name": "expr_member", "symbols": [{"literal":"("}, "_", "expression+", "_", {"literal":")"}], "postprocess": ([_a, _b, c]) => ({subexpression: c})},
    {"name": "expr_member", "symbols": ["expr_member", "_", "ebnf_modifier"], "postprocess": ([a, _b, c]) => ({ebnf: a, modifier: c})},
    {"name": "ebnf_modifier", "symbols": [{"literal":":+"}], "postprocess": getValue},
    {"name": "ebnf_modifier", "symbols": [{"literal":":*"}], "postprocess": getValue},
    {"name": "ebnf_modifier", "symbols": [{"literal":":?"}], "postprocess": getValue},
    {"name": "expr", "symbols": ["expr_member"]},
    {"name": "expr", "symbols": ["expr", "ws", "expr_member"], "postprocess": ([a, _b, c]) => [...a, c]},
    {"name": "word", "symbols": [({type: "word"})], "postprocess": getValue},
    {"name": "string", "symbols": [({type: "string"})], "postprocess": ([{value}]) => ({literal: value})},
    {"name": "string", "symbols": [({type: "btstring"})], "postprocess": ([{value}]) => ({literal: value})},
    {"name": "charclass", "symbols": [({type: "charclass"})], "postprocess": ([a]) => new RegExp(a)},
    {"name": "js", "symbols": [({type: "js"})], "postprocess": getValue},
    {"name": "_$e$1", "symbols": ["ws"], "postprocess": id},
    {"name": "_$e$1", "symbols": [], "postprocess": (_) => null},
    {"name": "_", "symbols": ["_$e$1"]},
    {"name": "ws", "symbols": [({type: "ws"})]},
    {"name": "ws$e$1", "symbols": [({type: "ws"})], "postprocess": id},
    {"name": "ws$e$1", "symbols": [], "postprocess": (_) => null},
    {"name": "ws", "symbols": ["ws$e$1", ({type: "comment"}), "_"]}
];
const ParserStart = "final";
const grammar = {Lexer, ParserRules, ParserStart};
export default grammar;
