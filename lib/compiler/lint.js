// Node-only
import process from 'node:process';

const warn = ({out}, string_) => {
	out.write(`WARN\t${string_}\n`);
};

function lintNames({rules}, options) {
	const all = [];
	for (const {name} of rules) {
		all.push(name);
	}

	for (const {symbols} of rules) {
		for (const symbol of symbols) {
			if (
				!symbol.literal &&
				!symbol.token &&
				symbol.constructor !== RegExp &&
				!all.includes(symbol)
			) {
				warn(options, `Undefined symbol \`${symbol}\` used.`);
			}
		}
	}
}

export function lint(grm, options) {
	if (!options.out) {
		options.out = process.stderr;
	}

	lintNames(grm, options);
}
