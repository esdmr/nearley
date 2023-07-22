import {RawSourceCode} from '../ast.js';
import {builtinPostprocessors} from './utils.js';

/**
 * @template T
 * @param {Iterable<T>} [a]
 * @param {Iterable<T>[]} more
 * @returns {Generator<T[]>}
 */
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

/**
 * @param {import('../compile.js').Compiler} parser
 */
export function* tsd({version, body, rules, config}) {
	yield `// Generated automatically by nearley, version ${version}`;

	if (config.get('tsNoCheck')) {
		yield '// @ts-nocheck';
	}

	yield `import * as nearley from ${JSON.stringify(
		config.get('nearley') ?? 'nearley',
	)};`;
	yield 'const __a = 0 as unknown as readonly [any, any, any, any, any, any, any, any,...any[]];';
	yield 'const __t = 0 as unknown as nearley.lexer.Token;';
	yield* body;

	/** @type {Map<string, import('../ast.js').Rule[]>} */
	const map = new Map();

	for (const rule of rules) {
		if (typeof rule.postprocess === 'string') {
			const source = builtinPostprocessors.get(rule.postprocess);

			if (!source) {
				throw new Error(
					`Invalid builtin postprocess used: ${rule.postprocess}`,
				);
			}

			rule.postprocess = new RawSourceCode(source);
		} else if (!rule.postprocess) {
			rule.postprocess = config.get('default_postprocess');
		}

		if (map.has(rule.name)) {
			/** @type {import('../ast.js').Rule[]} */ (map.get(rule.name)).push(rule);
		} else {
			map.set(rule.name, [rule]);
		}
	}

	/** @param {string} string */
	function normalize(string) {
		return string.replaceAll(/\s{2,}/g, ' ').trim();
	}

	const defaultDepth = Math.max(
		Number(config.get('tsd_default_depth')) || 2,
		2,
	);
	const macroDepth = Math.min(Number(config.get('tsd_macro_depth')) || 1, 1);

	/**
	 * @param {string} name
	 * @returns {Generator<string>}
	 */
	function* expandRules(name, depth = defaultDepth) {
		for (const rule of map.get(name) ?? []) {
			if (!rule.postprocessProcessed) {
				rule.postprocess = normalize(String(rule.postprocess || ''));
				if (rule.postprocess) rule.postprocess = `(${rule.postprocess})`;
				rule.postprocessProcessed = true;
			}

			if (depth <= 1) {
				yield rule.postprocess ? `${rule.postprocess}(__a)` : '__a';
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
						: ['__t'],
				),
			)) {
				yield `${rule.postprocess}([${combination
					.map((i) => normalize(i))
					.join(', ')}] as const)`;
			}
		}
	}

	for (const name of map.keys()) {
		yield `// ${name}`;

		for (const line of expandRules(name)) {
			yield `${line};`;
		}
	}
}
