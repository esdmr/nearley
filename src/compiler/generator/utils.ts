import {Rule as RuntimeRule} from '../../runtime/rule.js';
import type {Rule as RuleNode} from '../ast.js';
import {LiteralSymbol, TokenSymbol, type RuntimeSymbol} from '../symbol.js';

export const builtinPostprocessors = new Map([
	['joiner', "(d) => d.join('')"],
	['arrconcat', '(d) => [d[0],...d[1]]'],
	['arrpush', '(d) => [...d[0],d[1]]'],
	['void', '(_) => undefined'],
	['id', 'nearley.id'],
]);

export function serializeRules(
	rules: readonly RuleNode[],
	defaultPostprocess?: string,
) {
	return `[\n\t${rules
		.map((rule) => serializeRule(rule, defaultPostprocess))
		.join(',\n\t')}\n]`;
}

export function serializeSymbol(s: RuntimeSymbol) {
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

function serializeRule(rule: RuleNode, defaultPostprocess?: string) {
	let returnValue = `new nearley.${RuntimeRule.name}(`;
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
	} else if (defaultPostprocess) {
		returnValue += `, ${defaultPostprocess}`;
	}

	returnValue += ')';
	return returnValue;
}
