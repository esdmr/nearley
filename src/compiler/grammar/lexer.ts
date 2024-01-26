import moo from 'moo';

function literals(list: readonly string[]) {
	return Object.fromEntries(list.map((i) => [i, {match: i, next: 'main'}]));
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
			type: moo.keywords({
				// eslint-disable-next-line @typescript-eslint/naming-convention
				keyword_null: 'null',
			}),
		},
		string: {
			match: /"(?:[^\\"\n]|\\["\\/bfnrt]|\\u[a-fA-F\d]{4})*"/u,
			value: (x: string) => String(JSON.parse(x)),
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

export const lexer = moo.states({
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
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'[': {match: '[', next: 'main'},
	},
});
