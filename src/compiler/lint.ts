import {NonterminalSymbol} from '../runtime/symbol.js';
import type {Compiler} from './compile.js';

function lintNames({rules}: Compiler) {
	const all = new Set(rules.map((i) => i.name));

	for (const {symbols} of rules) {
		for (const symbol of symbols) {
			if (symbol instanceof NonterminalSymbol && !all.has(symbol.name)) {
				console.warn(`Undefined symbol ${symbol.toString()} used.`);
			}
		}
	}
}

export function lint(compiler: Compiler) {
	lintNames(compiler);
}
