// Node-only

import type {Compiler} from './compile.js';

function lintNames({rules}: Compiler) {
	const all = new Set(rules.map((i) => i.name));

	for (const {symbols} of rules) {
		for (const symbol of symbols) {
			if (typeof symbol === 'string' && !all.has(symbol)) {
				console.warn(`Undefined symbol \`${symbol}\` used.`);
			}
		}
	}
}

export function lint(compiler: Compiler) {
	lintNames(compiler);
}
