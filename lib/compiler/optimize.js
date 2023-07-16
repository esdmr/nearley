import {Uniquer} from './uniquer.js';

export function optimize(rules) {
	const replacements = new Map();

	do {
		const byName = new Map();

		for (const rule of rules) {
			if (byName.has(rule.name)) {
				byName.get(rule.name).add(rule);
			} else {
				byName.set(rule.name, new Set([rule]));
			}
		}

		const hash = new Map();
		replacements.clear();

		for (const [name, rules] of byName) {
			const hashKey = [...rules]
				.map((i) =>
					JSON.stringify({
						s: i.symbols.map((j) => (j === i.name ? '' : j)),
						p: i.postprocess,
					}),
				)
				.sort()
				.join('');

			if (hash.has(hashKey)) {
				const altName = hash.get(hashKey);

				if (compareArray(name, altName) > 0) {
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
		rules = rules.filter((i) => !replacements.has(i.name));

		for (const rule of rules) {
			for (const [index, item] of rule.symbols.entries()) {
				if (replacements.has(item)) {
					rule.symbols[index] = replacements.get(item);
				}
			}
		}
	} while (replacements.size > 0);

	const uniqueNames = new Uniquer();
	const minNames = new Map();

	function minifyName(name) {
		if (minNames.has(name)) return minNames.get(name);
		if (!name.includes('$')) return name;

		const min = uniqueNames.get(name.split('$', 1)[0]);
		minNames.set(name, min);
		return min;
	}

	for (const rule of rules) {
		rule.name = minifyName(rule.name);

		for (const [index, item] of rule.symbols.entries()) {
			if (typeof item === 'string') {
				rule.symbols[index] = minifyName(item);
			}
		}
	}

	console.log('Minified names:', minNames);
}

function compareArray(a, b) {
	const i = a.length - b.length;
	if (i) return i;

	for (const [index, x] of a.entries()) {
		const y = b[index];
		let i;

		if (Number.isNaN(Number(x) + Number(y))) {
			i = String(x) < String(y) ? -1 : String(x) > String(y) ? 1 : 0;
		} else {
			i = x - y;
		}

		if (i) return i;
	}

	return 0;
}
