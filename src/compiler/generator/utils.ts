import {Rule as RuntimeRule} from '../../runtime/rule.js';
import type {Rule as RuleNode} from '../ast.js';
import {
	LiteralSymbol,
	TokenSymbol,
	type RuntimeSymbol,
	NonterminalSymbol,
	RegExpSymbol,
} from '../../runtime/symbol.js';
import {array, id, ignore, string} from '../../runtime/postprocess.js';

export type BuiltinPostprocessor =
	| typeof string
	| typeof array
	| typeof ignore
	| typeof id;

export const builtinPostprocessors = new Map<BuiltinPostprocessor, string>([
	[string, `nearley.${string.name}`],
	[array, `nearley.${array.name}`],
	[ignore, `nearley.${ignore.name}`],
	[id, `nearley.${id.name}`],
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
	if (s instanceof NonterminalSymbol) {
		return `new nearley.${NonterminalSymbol.name}(${JSON.stringify(s.name)})`;
	}

	if (s instanceof RegExpSymbol) {
		return `new nearley.${RegExpSymbol.name}(${JSON.stringify(s.pattern)})`;
	}

	if (s instanceof LiteralSymbol) {
		return `new nearley.${LiteralSymbol.name}(${JSON.stringify(s.value)})`;
	}

	if (s instanceof TokenSymbol) {
		return `new nearley.${TokenSymbol.name}(${JSON.stringify(s.token)})`;
	}

	throw new TypeError(`Unknown symbol: ${typeof s} ${JSON.stringify(s)}`);
}

export function serializePostprocess(
	postprocess: RuleNode['postprocess'],
	defaultPostprocess?: string,
) {
	return typeof postprocess === 'function'
		? builtinPostprocessors.get(postprocess)
		: postprocess?.source ?? defaultPostprocess;
}

function serializeRule(rule: RuleNode, defaultPostprocess?: string) {
	const name = JSON.stringify(rule.name);
	const symbols = `[${rule.symbols.map((s) => serializeSymbol(s)).join(', ')}]`;

	let postprocess = serializePostprocess(rule.postprocess, defaultPostprocess);
	postprocess = postprocess ? `, ${postprocess.trim()}` : '';

	return `new nearley.${RuntimeRule.name}(${name}, ${symbols}${postprocess})`;
}
