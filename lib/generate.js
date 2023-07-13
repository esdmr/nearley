function serializeRules(rules, builtinPostprocessors, extraIndent = '') {
	return `[\n    ${rules
		.map((rule) => serializeRule(rule, builtinPostprocessors))
		.join(',\n    ')}\n${extraIndent}]`;
}

function dedentFunc(func) {
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

function tabulateString(string, indent, options) {
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

export const generate = (parser, exportName) => {
	if (!parser.config.preprocessor) {
		parser.config.preprocessor = '_default';
	}

	if (!generate[parser.config.preprocessor]) {
		throw new Error(`No such preprocessor: ${parser.config.preprocessor}`);
	}

	return generate[parser.config.preprocessor](parser, exportName);
};

generate.javascript = (parser, exportName) => {
	let output = `// Generated automatically by nearley, version ${parser.version}\n`;
	output += '// http://github.com/Hardmath123/nearley\n';
	output += '(function () {\n';
	output += 'function id(x) { return x[0]; }\n';
	output += parser.body.join('\n');
	output += 'var grammar = {\n';
	output += `    Lexer: ${parser.config.lexer},\n`;
	output += `    ParserRules: ${serializeRules(
		parser.rules,
		generate.javascript.builtinPostprocessors,
	)}\n`;
	output += `  , ParserStart: ${JSON.stringify(parser.start)}\n`;
	output += '}\n';
	output +=
		"if (typeof module !== 'undefined'" +
		"&& typeof module.exports !== 'undefined') {\n";
	output += '   module.exports = grammar;\n';
	output += '} else {\n';
	output += `   window.${exportName} = grammar;\n`;
	output += '}\n';
	output += '})();\n';
	return output;
};

generate.js = generate.javascript;

generate.javascript.builtinPostprocessors = {
	joiner: "function joiner(d) {return d.join('');}",
	arrconcat: 'function arrconcat(d) {return [d[0]].concat(d[1]);}',
	arrpush: 'function arrpush(d) {return d[0].concat([d[1]]);}',
	nuller: 'function() {return null;}',
	id: 'id',
};

generate.esmodule = (parser) => {
	let output = `// Generated automatically by nearley, version ${parser.version}\n`;
	output += '// http://github.com/Hardmath123/nearley\n';
	output += 'function id(x) { return x[0]; }\n';
	output += parser.body.join('\n');
	output += `const Lexer = ${parser.config.lexer};\n`;
	output += `const ParserRules = ${serializeRules(
		parser.rules,
		generate.typescript.builtinPostprocessors,
	)};\n`;
	output += `const ParserStart = ${JSON.stringify(parser.start)};\n`;
	output += 'const grammar = {Lexer, ParserRules, ParserStart};\n';
	output += 'export default grammar;\n';
	return output;
};

generate.module = generate.esmodule;
generate._default = generate.module;

generate.coffeescript = (parser, exportName) => {
	let output = `# Generated automatically by nearley, version ${parser.version}\n`;
	output += '# http://github.com/Hardmath123/nearley\n';
	output += 'do ->\n';
	output += '  id = (d) -> d[0]\n';
	output += `${tabulateString(dedentFunc(parser.body.join('\n')), '  ')}\n`;
	output += '  grammar = {\n';
	output += `    Lexer: ${parser.config.lexer},\n`;
	output += `    ParserRules: ${tabulateString(
		serializeRules(parser.rules, generate.coffeescript.builtinPostprocessors),
		'      ',
		{indentFirst: false},
	)},\n`;
	output += `    ParserStart: ${JSON.stringify(parser.start)}\n`;
	output += '  }\n';
	output +=
		"  if typeof module != 'undefined' " +
		"&& typeof module.exports != 'undefined'\n";
	output += '    module.exports = grammar;\n';
	output += '  else\n';
	output += `    window.${exportName} = grammar;\n`;
	return output;
};

generate.coffee = generate.coffeescript;
generate.cs = generate.coffee;

generate.coffeescript.builtinPostprocessors = {
	joiner: "(d) -> d.join('')",
	arrconcat: '(d) -> [d[0]].concat(d[1])',
	arrpush: '(d) -> d[0].concat([d[1]])',
	nuller: '() -> null',
	id: 'id',
};

generate.typescript = (parser) => {
	let output = `// Generated automatically by nearley, version ${parser.version}\n`;
	output += '// http://github.com/Hardmath123/nearley\n';
	output += '// Bypasses TS6133. Allow declared but unused functions.\n';
	output += '// @ts-ignore\n';
	output += 'function id<T>(d: readonly [T, ...any[]]): T { return d[0]; }\n';
	output += parser.customTokens
		.map((token) => `declare let ${token}: any;\n`)
		.join('');
	output += parser.body.join('\n');
	output += '\n';
	output += 'interface NearleyToken {\n';
	output += '  value: any;\n';
	output += '  [key: string]: any;\n';
	output += '};\n';
	output += '\n';
	output += 'interface NearleyLexer {\n';
	output += '  reset: (chunk: string, info: any) => void;\n';
	output += '  next: () => NearleyToken | undefined;\n';
	output += '  save: () => any;\n';
	output += '  formatError: (token: never) => string;\n';
	output += '  has: (tokenType: string) => boolean;\n';
	output += '};\n';
	output += '\n';
	output += 'interface NearleyRule {\n';
	output += '  name: string;\n';
	output += '  symbols: NearleySymbol[];\n';
	output += '  postprocess?: (d: any, loc?: number, reject?: {}) => any;\n';
	output += '};\n';
	output += '\n';
	output +=
		'type NearleySymbol = string | { type: string } | { literal: any } | { test: (token: any) => boolean };\n';
	output += '\n';
	output += 'interface Grammar {\n';
	output += '  Lexer: NearleyLexer | undefined;\n';
	output += '  ParserRules: NearleyRule[];\n';
	output += '  ParserStart: string;\n';
	output += '};\n';
	output += '\n';
	output += 'const grammar: Grammar = {\n';
	output += `  Lexer: ${parser.config.lexer},\n`;
	output += `  ParserRules: ${serializeRules(
		parser.rules,
		generate.typescript.builtinPostprocessors,
		'  ',
	)},\n`;
	output += `  ParserStart: ${JSON.stringify(parser.start)},\n`;
	output += '};\n';
	output += '\n';
	output += 'export default grammar;\n';

	return output;
};

generate.ts = generate.typescript;

generate.typescript.builtinPostprocessors = {
	joiner: "(d) => d.join('')",
	arrconcat: '(d) => [d[0],...d[1]]',
	arrpush: '(d) => [...d[0],d[1]]',
	nuller: '(_) => null',
	id: 'id',
};

function* cartesianProduct(a, ...more) {
	if (!a) {
		return yield [];
	}

	for (const v of a) {
		for (const c of cartesianProduct(...more)) {
			yield [v, ...c];
		}
	}
}

generate.tsd = ({version, body, rules}, exportName) => {
	let output = `// Generated automatically by nearley, version ${version}\n`;
	output += '// @ts-ignore\n';
	output += 'declare function id<T>(d: readonly [T, ...any[]]): T;\n';
	output += 'const __a = 0 as any;\n';
	output +=
		'const __A = __a as readonly [any, any, any, any, any, any, any, any,...any[]];\n';
	output += 'const __t = __a as Token;\n';
	output += body.join('\n');

	const map = new Map();

	for (const rule of rules) {
		if (rule.postprocess?.builtin) {
			rule.postprocess =
				generate.typescript.builtinPostprocessors[rule.postprocess.builtin];
		}

		if (map.has(rule.name)) {
			map.get(rule.name).add(rule);
		} else {
			map.set(rule.name, new Set([rule]));
		}
	}

	function normalize(string_) {
		return string_.replace(/\s{2,}/g, ' ').trim();
	}

	const parts = exportName.split(',');
	const defaultDepth = Math.max(Number(parts[0]) || 2, 2);
	const macroDepth = Math.min(Number(parts[1]) || 1, 1);

	function* expandRules(name, depth = defaultDepth) {
		for (const rule of map.get(name)) {
			if (!rule.postprocessProcessed) {
				rule.postprocess = normalize(rule.postprocess || '');
				if (rule.postprocess) {
					rule.postprocess = `(${rule.postprocess})`;
				}

				rule.postprocessProcessed = true;
			}

			if (depth <= 1) {
				yield rule.postprocess ? `${rule.postprocess}(__A)` : '__A';
				continue;
			}

			for (const combination of cartesianProduct(
				...rule.symbols.map((i) =>
					typeof i === 'string'
						? expandRules(
								i,
								i.includes('$m')
									? depth - defaultDepth / macroDepth
									: depth - 1,
						  )
						: typeof i === 'object' && i?.token
						? ['__t']
						: ['__a'],
				),
			)) {
				yield `${rule.postprocess}([${combination
					.map((i) => normalize(i))
					.join(', ')}] as const)`;
			}
		}
	}

	for (const name of map.keys()) {
		output += `// ${name}\n`;

		for (const line of expandRules(name)) {
			output += `${line};\n`;
		}
	}

	return output;
};
