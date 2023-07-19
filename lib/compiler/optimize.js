import {Uniquer} from './uniquer.js';

/** @param {import('./compile.js').Compiler} result */
export function optimize(result) {
	/** @type {Map<string, string>} */
	const replacements = new Map();

	do {
		/** @type {Map<string, import('./ast.js').Rule[]>} */
		const byName = new Map();
		/** @type {Set<import('./symbol.js').RuntimeSymbol>} */
		const found = new Set([result.start]);

		for (const rule of result.rules) {
			if (byName.has(rule.name)) {
				/** @type {import('./ast.js').Rule[]} */ (byName.get(rule.name)).push(
					rule,
				);
			} else {
				byName.set(rule.name, [rule]);
			}

			for (const item of rule.symbols) {
				found.add(item);
			}
		}

		/** @type {Map<string, string>} */
		const hash = new Map();
		replacements.clear();

		for (const [name, rules] of byName) {
			if (!found.has(name)) {
				replacements.set(name, '');
				continue;
			}

			const hashKey = [...rules]
				.map((i) =>
					// eslint-disable-next-line @internal/no-object-literals
					JSON.stringify({
						s: i.symbols.map((j) => (j === i.name ? '' : j)),
						p: i.postprocess,
					}),
				)
				.sort()
				.join('');

			if (hash.has(hashKey)) {
				const altName = /** @type {string} */ (hash.get(hashKey));

				if (compareArray(name.split('$'), altName.split('$')) > 0) {
					replacements.set(name, altName);
					hash.set(hashKey, altName);
				} else {
					replacements.set(altName, name);
				}
			} else {
				hash.set(hashKey, name);
			}
		}

		console.warn('Replacements:', replacements);
		result.rules = result.rules.filter((i) => !replacements.has(i.name));

		for (const rule of result.rules) {
			for (const [index, item] of rule.symbols.entries()) {
				if (typeof item === 'string' && replacements.has(item)) {
					rule.symbols[index] = /** @type {string} */ (replacements.get(item));
				}
			}
		}
	} while (replacements.size > 0);

	const uniqueNames = new Uniquer();
	/** @type {Map<string, string>} */
	const minNames = new Map();

	/** @param {string} name */
	function minifyName(name) {
		if (minNames.has(name)) return /** @type {string} */ (minNames.get(name));
		if (!name.includes('$')) return name;

		const min = uniqueNames.get(/** @type {string} */ (name.split('$', 1)[0]));
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

// eslint-disable-next-line @internal/no-object-literals
const arrayCollator = new Intl.Collator('en', {
	numeric: true,
	caseFirst: 'upper',
});

/**
 * @param {string[]} a
 * @param {string[]} b
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
