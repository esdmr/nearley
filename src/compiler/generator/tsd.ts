import {NonterminalSymbol} from '../../runtime/symbol.js';
import type {Rule} from '../ast.js';
import type {Compiler} from '../compile.js';
import {serializePostprocess} from './utils.js';

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

export function* tsd(compiler: Compiler) {
	yield `// Generated automatically by nearley, version ${compiler.options.version}`;
	yield '// https://github.com/esdmr/nearley (fork of https://github.com/Hardmath123/nearley)';

	if (compiler.config.get('ts_nocheck')?.asBoolean()) {
		yield '// @ts-nocheck';
	}

	yield `import * as nearley from ${JSON.stringify(
		compiler.config.get('nearley')?.value ?? '@esdmr/nearley',
	)};`;

	yield 'const __a = 0 as unknown as [any, any, any, any, any, any, any, any, ...any[]];';
	yield 'const __t = 0 as unknown as nearley.lexer.Token;';

	yield* compiler.body;

	if (compiler.config.has('lexer')) {
		yield '// A lexer was defined, but will not be used in this file.';
		yield `${compiler.config.get('lexer')?.value};`;
	}

	const map = new Map<string, Rule[]>();

	for (const rule of compiler.rules) {
		const rules = map.get(rule.name);

		if (rules) {
			rules.push(rule);
		} else {
			map.set(rule.name, [rule]);
		}
	}

	const defaultDepth = Math.max(
		Number(compiler.config.get('tsd_default_depth')?.value) || 2,
		2,
	);
	const macroDepth = Math.min(
		Number(compiler.config.get('tsd_macro_depth')?.value) || 1,
		1,
	);
	const postprocessProcessed = new Map<Rule, string | undefined>();

	function* expandRules(name: string, depth = defaultDepth): Generator<string> {
		for (const rule of map.get(name) ?? []) {
			if (!postprocessProcessed.has(rule)) {
				const postprocess = serializePostprocess(
					rule.postprocess,
					compiler.config.get('default_postprocess')?.value,
				);
				postprocessProcessed.set(
					rule,
					postprocess && `(${postprocess.trim()})`,
				);
			}

			if (depth <= 1) {
				const postprocess = postprocessProcessed.get(rule);
				yield postprocess ? `${postprocess}(__a)` : '__a';
				continue;
			}

			for (const combination of cartesianProduct(
				...rule.symbols.map((i) =>
					i instanceof NonterminalSymbol
						? expandRules(
								i.name,
								i.name.includes('$m')
									? depth - defaultDepth / macroDepth
									: depth - 1,
							)
						: ['__t'],
				),
			)) {
				const args = `[${combination.join(', ')}] as const`;
				const postprocess = postprocessProcessed.get(rule);
				yield postprocess ? `${postprocess}(${args})` : args;
			}
		}
	}

	for (const name of map.keys()) {
		yield `// ${name}`;

		for (const line of expandRules(name)) {
			yield `${line.replaceAll(/\s+/gu, ' ').trim()};`;
		}
	}
}
