import {builtinPostprocessors} from './typescript.js';

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

export function tsd({version, body, rules}, exportName) {
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
			rule.postprocess = builtinPostprocessors[rule.postprocess.builtin];
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
}
