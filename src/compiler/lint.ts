// Node-only

import type {Compiler} from './compile.js';

function lintNames({rules}: Compiler) {
	const all: string[] = [];

	for (const {name} of rules) {
		all.push(name);
	}

	for (const {symbols} of rules) {
		for (const symbol of symbols) {
			if (typeof symbol === 'string' && !all.includes(symbol)) {
				console.warn(`Undefined symbol \`${symbol}\` used.`);
			}
		}
	}
}

export function lint(compiler: Compiler) {
	lintNames(compiler);
}
