import type {Rule} from './ast.js';
import type {Compiler} from './compile.js';
import type {RuntimeSymbol} from './symbol.js';
import {Uniquer} from './uniquer.js';

/**
 * Converts rules to a string to be used in a hash map.
 */
function hashRules(rules: readonly Rule[]) {
	return rules
		.map((i) =>
			JSON.stringify({
				s: i.symbols.map((j) =>
					j === i.name ? '' : j instanceof RegExp ? {regex: String(j)} : j,
				),
				p: i.postprocess,
			}),
		)
		.sort()
		.join('');
}

const arrayCollator = new Intl.Collator('en', {
	numeric: true,
	caseFirst: 'upper',
});

/**
 * Compare two arrays of strings, preferring shorter arrays and uppercase
 * letters. Numeric strings are compared numerically.
 *
 * @see {@link arrayCollator} The collator instance which is used to compare the
 * strings.
 * @returns - a number representing the order of inputs, like the
 * {@link Array.sort} comparator:
 *
 * > It is expected to return a negative value if the first argument is less
 * > than the second argument, zero if they're equal, and a positive value
 * > otherwise.
 */
function compareArray(a: readonly string[], b: readonly string[]) {
	const i = a.length - b.length;
	if (i) return i;

	for (const [index, x] of a.entries()) {
		const y = b[index]!;
		const i = arrayCollator.compare(x, y);
		if (i) return i;
	}

	return 0;
}

/**
 * Generate a map of rules according to their names.
 */
function groupRulesByName(result: Compiler) {
	const rulesByName = new Map<string, Rule[]>();

	for (const rule of result.rules) {
		const rules = rulesByName.get(rule.name);

		if (rules) {
			rules.push(rule);
		} else {
			rulesByName.set(rule.name, [rule]);
		}
	}

	return rulesByName;
}

/**
 * Generates a map of rule hashes to their names.
 */
function getRuleHashes(rulesByName: Map<string, readonly Rule[]>) {
	const ruleHashes = new Map<string, string[]>();

	for (const [name, rules] of rulesByName) {
		const key = hashRules(rules);
		const value = ruleHashes.get(key);

		if (value === undefined) {
			ruleHashes.set(key, [name]);
			continue;
		}

		value.push(name);
	}

	return ruleHashes;
}

/**
 * Pick the simplest rule name to be used when generating the canonical rule
 * names.
 */
function getPreferredRuleName(ruleNames: readonly string[]) {
	return (
		ruleNames
			.map((i) => i.split('$'))
			.sort(compareArray)[0]
			?.join('$') ?? ''
	);
}

/**
 * Generate the replacement table for canonical rule names. Will pick the
 * simplest rule name out of equivalent rules.
 */
function getRuleCanonicalNames(ruleHashes: Map<string, readonly string[]>) {
	const replacements = new Map<string, string>();

	for (const rules of ruleHashes.values()) {
		const first = getPreferredRuleName(rules);

		for (const rule of rules) {
			if (rule !== first) {
				replacements.set(rule, first);
			}
		}
	}

	return replacements;
}

/**
 * Apply rule replacement tables. The key is the original name and the value is
 * the target name. Rules not in the replacement table will not be affected. As
 * a requirement, if replacement `A -> B` is in the table, `B` should not be in
 * the table and should actually be defined. Alternatively, if `A` is unused,
 * `B` may be anything, which causes `A` to be effectively deleted.
 */
function applyRuleReplacements(
	result: Compiler,
	replacements: Map<string, string>,
) {
	result.rules = result.rules.filter((i) => !replacements.has(i.name));

	for (const rule of result.rules) {
		for (const [index, item] of rule.symbols.entries()) {
			if (typeof item === 'string' && replacements.has(item)) {
				rule.symbols[index] = replacements.get(item)!;
			}
		}
	}
}

/**
 * Combine equivalent rules to the one with the simplest name.
 */
function combineRules(result: Compiler) {
	const rulesByName = groupRulesByName(result);
	const ruleHashes = getRuleHashes(rulesByName);
	const replacements = getRuleCanonicalNames(ruleHashes);

	console.warn('Canonical rule names:', replacements);
	applyRuleReplacements(result, replacements);
}

/**
 * Get a set of rules which are used by other rules or are the starting rule.
 */
function getUsedRules(result: Compiler) {
	const usedSymbols = new Set<RuntimeSymbol>([result.start]);

	for (const rule of result.rules) {
		for (const item of rule.symbols) {
			usedSymbols.add(item);
		}
	}

	return usedSymbols;
}

/**
 * Generates the replacement table to get rid of unused rules.
 */
function getUnusedRuleReplacements(
	result: Compiler,
	usedSymbols: Set<RuntimeSymbol>,
) {
	return new Map(
		result.rules
			.filter((i) => !usedSymbols.has(i.name))
			.map((i) => [i.name, '']),
	);
}

/**
 * Removes rules which do not appear in the RHS or is not the starting rule.
 */
function removeUnusedRules(result: Compiler) {
	const usedSymbols = getUsedRules(result);
	const replacements = getUnusedRuleReplacements(result, usedSymbols);

	console.warn('Unused rules:', replacements);
	applyRuleReplacements(result, replacements);
}

/**
 * Simplify the end of compiler generated rule names.
 */
function shortenRuleNameEnding(result: Compiler) {
	const uniqueNames = new Uniquer();
	const minNames = new Map<string, string>();

	function minifyName(name: string) {
		if (minNames.has(name)) return minNames.get(name)!;
		if (!name.includes('$')) return name;

		const min = uniqueNames.get(name.split('$', 1)[0]!);
		minNames.set(name, min);
		return min;
	}

	for (const rule of result.rules) {
		rule.name = minifyName(rule.name);

		for (const [index, item] of rule.symbols.entries()) {
			if (typeof item === 'string') {
				rule.symbols[index] = minifyName(item);
			}
		}
	}

	console.warn('Minified names:', minNames);
}

/**
 * Run all optimization phases.
 */
export function optimize(result: Compiler) {
	combineRules(result);
	removeUnusedRules(result);
	shortenRuleNameEnding(result);
}
