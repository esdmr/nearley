# nearley grammar
@{%
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
%}

@lexer lexer
@nearley "#nearley"
@tsNoCheck true

final -> _ prog _ %ws:?  {% ([, a]) => a %}

prog -> prod
      | prod ws prog  {% ([a, _b, c]) => [a, ...c] %}

prod -> word _ %arrow _ expression+  {% d => new Production(d[0], d[4]) %}
      | word "[" _ wordlist _ "]" _ %arrow _ expression+ {% d => new MacroDefinition(d[0], d[3], d[9]) %}
      | "@" _ js  {% ([_a, _b, c]) => c %}
      | "@" word ws word  {% d => new Config(d[1], d[3]) %}
      | "@" word ws string  {% d => new Config(d[1], d[3].value) %}
      | "@include"  _ string {% ([_a, _b, {value}]) => new Include(value) %}

expression+ -> completeexpression
             | expression+ _ "|" _ completeexpression  {% d => [...d[0], d[4]] %}

expressionlist -> completeexpression
                | expressionlist _ "," _ completeexpression {% d => [...d[0], d[4]] %}

wordlist -> word
          | wordlist _ "," _ word {% d => [...d[0], d[4]] %}

completeexpression -> expr  {% ([a]) => new Expression(a) %}
                    | expr _ js  {% ([a, _b, c]) => new Expression(a, c) %}

expr_member ->
      %word {% getValue %}
    | %keyword_null {% () => '' %}
    | "$" word {% ([, a]) => new MacroParameterSymbol(a) %}
    | word "[" _ expressionlist _ "]" {% d => new MacroCallSymbol(d[0], d[3]) %}
    | string "i":? {% ([a, b]) => b ? insensitive(a) : a %}
    | "%" word {% ([, a]) => new nearley.TokenSymbol(a) %}
    | charclass {% nearley.id %}
    | "(" _ expression+ _ ")" {% ([_a, _b, c]) => new SubExpressionSymbol(c) %}
    | expr_member _ ebnf_modifier {% ([a, _b, c]) => new EbnfSymbol(a, c) %}

ebnf_modifier -> ":+" {% () => EbnfSymbol.plus %}
               | ":*" {% () => EbnfSymbol.star %}
               | ":?" {% () => EbnfSymbol.opt %}

expr -> expr_member
      | expr ws expr_member  {% ([a, _b, c]) => [...a, c] %}

word -> %word {% getValue %}
      | %keyword_null {% getValue %}

string -> %string {% ([{value}]) => new nearley.LiteralSymbol(value) %}
        | %btstring {% ([{value}]) => new nearley.LiteralSymbol(value) %}

charclass -> %charclass  {% ([a]) => new RegExp(a) %}

js -> %js  {% ([{value}]) => new RawSourceCode(value) %}

_ -> ws:?
ws -> %ws
    | %ws:? %comment _
