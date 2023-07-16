export function serializeRules(rules, builtinPostprocessors, extraIndent = '') {
	return `[\n    ${rules
		.map((rule) => serializeRule(rule, builtinPostprocessors))
		.join(',\n    ')}\n${extraIndent}]`;
}

export function dedentFunc(func) {
	const lines = func.toString().split(/\n/);

	if (lines.length === 1) {
		return [lines[0].replace(/^\s+|\s+$/g, '')];
	}

	let indent = null;
	const tail = lines.slice(1);
	for (const element of tail) {
		const match = /^\s*/.exec(element);
		if (
			match &&
			match[0].length !== element.length &&
			(indent === null || match[0].length < indent.length)
		) {
			indent = match[0];
		}
	}

	if (indent === null) {
		return lines;
	}

	return lines.map((line) => {
		if (line.slice(0, indent.length) === indent) {
			return line.slice(indent.length);
		}

		return line;
	});
}

export function tabulateString(string, indent, options) {
	const lines = Array.isArray(string) ? string : string.toString().split('\n');

	options = options || {};
	const tabulated = lines
		.map((line, i) => {
			let shouldIndent = true;

			if (i === 0 && !options.indentFirst) {
				shouldIndent = false;
			}

			if (shouldIndent) {
				return indent + line;
			}

			return line;
		})
		.join('\n');

	return tabulated;
}

function serializeSymbol(s) {
	if (s instanceof RegExp) {
		return s.toString();
	}

	if (s.token) {
		return s.token;
	}

	return JSON.stringify(s);
}

function serializeRule(rule, builtinPostprocessors) {
	let returnValue = '{';
	returnValue += `"name": ${JSON.stringify(rule.name)}`;
	returnValue += `, "symbols": [${rule.symbols
		.map((s) => serializeSymbol(s))
		.join(', ')}]`;
	if (rule.postprocess) {
		if (rule.postprocess.builtin) {
			rule.postprocess = builtinPostprocessors[rule.postprocess.builtin];
		}

		returnValue += `, "postprocess": ${tabulateString(
			dedentFunc(rule.postprocess),
			'        ',
			{indentFirst: false},
		)}`;
	}

	returnValue += '}';
	return returnValue;
}
