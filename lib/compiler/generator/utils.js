import {Rule} from '../../runtime/rule.js';
import {LiteralSymbol, TokenSymbol} from '../symbol.js';

export const builtinPostprocessors = new Map([
	['joiner', "(d) => d.join('')"],
	['arrconcat', '(d) => [d[0],...d[1]]'],
	['arrpush', '(d) => [...d[0],d[1]]'],
	['void', '(_) => undefined'],
	['id', 'nearley.id'],
]);

/**
 * @param {import('../ast.js').Rule[]} rules
 */
export function serializeRules(rules) {
	return `[\n\t${rules.map((rule) => serializeRule(rule)).join(',\n\t')}\n]`;
}

/** @param {import('../symbol.js').RuntimeSymbol} s */
export function serializeSymbol(s) {
	if (typeof s === 'string') {
		return JSON.stringify(s);
	}

	if (s instanceof RegExp) {
		return s.toString();
	}

	if (s instanceof LiteralSymbol) {
		return `new nearley.${LiteralSymbol.name}(${JSON.stringify(s.value)})`;
	}

	if (s instanceof TokenSymbol) {
		return `new nearley.${TokenSymbol.name}(${JSON.stringify(s.token)})`;
	}

	throw new TypeError(`Unknown symbol ${String(s)}`);
}

/**
 * @param {import('../ast.js').Rule} rule
 */
function serializeRule(rule) {
	let returnValue = `new nearley.${Rule.name}(`;
	returnValue += JSON.stringify(rule.name);
	returnValue += `, [${rule.symbols
		.map((s) => serializeSymbol(s))
		.join(', ')}]`;

	if (rule.postprocess) {
		const postprocess =
			typeof rule.postprocess === 'string'
				? builtinPostprocessors.get(rule.postprocess)
				: rule.postprocess.source;

		returnValue += `, ${postprocess}`;
	}

	returnValue += ')';
	return returnValue;
}
