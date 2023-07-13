# nearley grammar
@{%
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
            '@builtin',
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
%}

@lexer lexer

final -> _ prog _ %ws:?  {% ([, a]) => a %}

prog -> prod  {% ([a]) => [a] %}
      | prod ws prog  {% ([a, _b, c]) => [a, ...c] %}

prod -> word _ %arrow _ expression+  {% d => ({name: d[0], rules: d[4]}) %}
      | word "[" _ wordlist _ "]" _ %arrow _ expression+ {% d => ({macro: d[0], args: d[3], exprs: d[9]}) %}
      | "@" _ js  {% ([_a, _b, c]) => ({body: c}) %}
      | "@" word ws word  {% d => ({config: d[1], value: d[3]}) %}
      | "@include"  _ string {% ([_a, _b, {literal}]) => ({include: literal, builtin: false}) %}
      | "@builtin"  _ string {% ([_a, _b, {literal}]) => ({include: literal, builtin: true }) %}

expression+ -> completeexpression
             | expression+ _ "|" _ completeexpression  {% d => [...d[0], d[4]] %}

expressionlist -> completeexpression
             | expressionlist _ "," _ completeexpression {% d => [...d[0], d[4]] %}

wordlist -> word
            | wordlist _ "," _ word {% d => [...d[0], d[4]] %}

completeexpression -> expr  {% ([a]) => ({tokens: a}) %}
                    | expr _ js  {% ([a, _b, c]) => ({tokens: a, postprocess: c}) %}

expr_member ->
      word {% id %}
    | "$" word {% ([, a]) => ({mixin: a}) %}
    | word "[" _ expressionlist _ "]" {% d => ({macrocall: d[0], args: d[3]}) %}
    | string "i":? {% ([a, b]) => b ? insensitive(a) : a %}
    | "%" word {% ([, a]) => ({token: a}) %}
    | charclass {% id %}
    | "(" _ expression+ _ ")" {% ([_a, _b, c]) => ({subexpression: c}) %}
    | expr_member _ ebnf_modifier {% ([a, _b, c]) => ({ebnf: a, modifier: c}) %}

ebnf_modifier -> ":+" {% getValue %} | ":*" {% getValue %} | ":?" {% getValue %}

expr -> expr_member
      | expr ws expr_member  {% ([a, _b, c]) => [...a, c] %}

word -> %word {% getValue %}

string -> %string {% ([{value}]) => ({literal: value}) %}
        | %btstring {% ([{value}]) => ({literal: value}) %}

charclass -> %charclass  {% ([a]) => new RegExp(a) %}

js -> %js  {% getValue %}

_ -> ws:?
ws -> %ws
      | %ws:? %comment _
