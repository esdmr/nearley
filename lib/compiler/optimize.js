import {Uniquer} from './uniquer.js';

/**
 * Converts rules to a string to be used in a hash map.
 *
 * @param {import('./ast.js').Rule[]} rules
 */
function hashRules(rules) {
	return rules
		.map((i) =>
			JSON.stringify({
				s: i.symbols.map((j) =>
					j === i.name
						? ''
						: j instanceof RegExp
						? {regex: String(j)}
						: j,
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
 * @param {string[]} a
 * @param {string[]} b
 * @returns - a number representing the order of inputs, like the
 * {@link Array.sort} comparator:
 *
 * > It is expected to return a negative value if the first argument is less
 * > than the second argument, zero if they're equal, and a positive value
 * > otherwise.
 */
function compareArray(a, b) {
	const i = a.length - b.length;
	if (i) return i;

	for (const [index, x] of a.entries()) {
		const y = /** @type {string} */ (b[index]);
		const i = arrayCollator.compare(x, y);
		if (i) return i;
	}

	return 0;
}

/**
 * Generate a map of rules according to their names.
 *
 * @param {import("./compile.js").Compiler} result
 */
function groupRulesByName(result) {
	/** @type {Map<string, import('./ast.js').Rule[]>} */
	const rulesByName = new Map();

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
 *
 * @param {Map<string, import("./ast.js").Rule[]>} rulesByName
 */
function getRuleHashes(rulesByName) {
	/** @type {Map<string, string[]>} */
	const ruleHashes = new Map();

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
 *
 * @param {string[]} ruleNames
 */
function getPreferredRuleName(ruleNames) {
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
 *
 * @param {Map<string, string[]>} ruleHashes
 */
function getRuleCanonicalNames(ruleHashes) {
	/** @type {Map<string, string>} */
	const replacements = new Map();

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
 *
 * @param {import("./compile.js").Compiler} result
 * @param {Map<string, string>} replacements
 */
function applyRuleReplacements(result, replacements) {
	result.rules = result.rules.filter((i) => !replacements.has(i.name));

	for (const rule of result.rules) {
		for (const [index, item] of rule.symbols.entries()) {
			if (typeof item === 'string' && replacements.has(item)) {
				rule.symbols[index] = /** @type {string} */ (
					replacements.get(item)
				);
			}
		}
	}
}

/**
 * Combine equivalent rules to the one with the simplest name.
 *
 * @param {import("./compile.js").Compiler} result
 */
function combineRules(result) {
	const rulesByName = groupRulesByName(result);
	const ruleHashes = getRuleHashes(rulesByName);
	const replacements = getRuleCanonicalNames(ruleHashes);

	console.warn('Canonical rule names:', replacements);
	applyRuleReplacements(result, replacements);
}

/**
 * Get a set of rules which are used by other rules or are the starting rule.
 *
 * @param {import("./compile.js").Compiler} result
 */
function getUsedRules(result) {
	/** @type {Set<import('./symbol.js').RuntimeSymbol>} */
	const usedSymbols = new Set([result.start]);

	for (const rule of result.rules) {
		for (const item of rule.symbols) {
			usedSymbols.add(item);
		}
	}

	return usedSymbols;
}

/**
 * Generates the replacement table to get rid of unused rules.
 *
 * @param {import("./compile.js").Compiler} result
 * @param {Set<import("./symbol.js").RuntimeSymbol>} usedSymbols
 */
function getUnusedRuleReplacements(result, usedSymbols) {
	return new Map(
		result.rules
			.filter((i) => !usedSymbols.has(i.name))
			.map((i) => [i.name, '']),
	);
}

/**
 * Removes rules which do not appear in the RHS or is not the starting rule.
 *
 * @param {import("./compile.js").Compiler} result
 */
function removeUnusedRules(result) {
	const usedSymbols = getUsedRules(result);
	const replacements = getUnusedRuleReplacements(result, usedSymbols);

	console.warn('Unused rules:', replacements);
	applyRuleReplacements(result, replacements);
}

/**
 * Simplify the end of compiler generated rule names.
 *
 * @param {import("./compile.js").Compiler} result
 */
function shortenRuleNameEnding(result) {
	const uniqueNames = new Uniquer();
	/** @type {Map<string, string>} */
	const minNames = new Map();

	/** @param {string} name */
	function minifyName(name) {
		if (minNames.has(name))
			return /** @type {string} */ (minNames.get(name));
		if (!name.includes('$')) return name;

		const min = uniqueNames.get(
			/** @type {string} */ (name.split('$', 1)[0]),
		);
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
 *
 * @param {import('./compile.js').Compiler} result
 */
export function optimize(result) {
	combineRules(result);
	removeUnusedRules(result);
	shortenRuleNameEnding(result);
}
