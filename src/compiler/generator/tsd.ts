import {RawSourceCode, type Rule} from '../ast.js';
import type {Compiler} from '../compile.js';
import {builtinPostprocessors} from './utils.js';

function* cartesianProduct<T>(
	a?: Iterable<T>,
	...more: Array<Iterable<T>>
): Generator<readonly T[]> {
	if (!a) {
		return yield [];
	}

	for (const v of a) {
		for (const c of cartesianProduct(...more)) {
			yield [v, ...c];
		}
	}
}

export function* tsd({version, body, rules, config}: Compiler) {
	yield `// Generated automatically by nearley, version ${version}`;
	yield '// https://github.com/esdmr/nearley (fork of https://github.com/Hardmath123/nearley)';

	if (config.get('ts_nocheck')?.toBoolean()) {
		yield '// @ts-nocheck';
	}

	yield `import * as nearley from ${JSON.stringify(
		config.get('nearley')?.value ?? '@esdmr/nearley',
	)};`;
	yield 'const __a = 0 as unknown as [any, any, any, any, any, any, any, any, ...any[]];';
	yield 'const __t = 0 as unknown as nearley.lexer.Token;';
	yield* body;

	if (config.has('lexer')) {
		yield '// A lexer was defined, but will not be used in this file.';
		yield `${String(config.get('lexer'))};`;
	}

	const map = new Map<string, Rule[]>();

	for (const rule of rules) {
		if (typeof rule.postprocess === 'string') {
			const source = builtinPostprocessors.get(rule.postprocess);

			if (!source) {
				throw new Error(
					`Invalid builtin postprocess used: ${JSON.stringify(
						rule.postprocess,
					)}`,
				);
			}

			rule.postprocess = new RawSourceCode(source);
		} else if (!rule.postprocess) {
			rule.postprocess = config.get('default_postprocess')?.value;
		}

		const rules = map.get(rule.name);
		if (rules) {
			rules.push(rule);
		} else {
			map.set(rule.name, [rule]);
		}
	}

	function normalize(string: string) {
		return string.replaceAll(/\s{2,}/gu, ' ').trim();
	}

	const defaultDepth = Math.max(
		Number(config.get('tsd_default_depth')) || 2,
		2,
	);
	const macroDepth = Math.min(Number(config.get('tsd_macro_depth')) || 1, 1);

	function* expandRules(name: string, depth = defaultDepth): Generator<string> {
		for (const rule of map.get(name) ?? []) {
			if (!rule.postprocessProcessed) {
				rule.postprocess = normalize(String(rule.postprocess ?? ''));
				if (rule.postprocess) rule.postprocess = `(${rule.postprocess})`;
				rule.postprocessProcessed = true;
			}

			if (depth <= 1) {
				yield rule.postprocess ? `${String(rule.postprocess)}(__a)` : '__a';
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
				yield `${String(rule.postprocess)}([${combination
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
