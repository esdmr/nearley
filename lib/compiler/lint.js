// Node-only

/**
 * @param {import('./compile.js').Compiler} compiler
 */
function lintNames({rules}) {
	/** @type {string[]} */
	const all = [];

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

/**
 * @param {import("./compile.js").Compiler} compiler
 */
export function lint(compiler) {
	lintNames(compiler);
}
