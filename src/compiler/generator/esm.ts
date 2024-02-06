import {Grammar} from '../../runtime/grammar.js';
import type {Compiler} from '../compile.js';
import {serializeRules} from './utils.js';

export function* esm(compiler: Compiler) {
	yield `// Generated automatically by nearley, version ${compiler.options.version}`;
	yield '// https://github.com/esdmr/nearley (fork of https://github.com/Hardmath123/nearley)';

	if (compiler.config.get('ts_nocheck')?.asBoolean()) {
		yield '// @ts-nocheck';
	}

	yield `import * as nearley from ${JSON.stringify(
		compiler.config.get('nearley')?.value ?? '@esdmr/nearley',
	)};`;

	yield* compiler.body;

	yield `export default new nearley.${Grammar.name}(${serializeRules(
		compiler.rules,
		compiler.config.get('default_postprocess')?.value,
	)}, ${JSON.stringify(compiler.start)}, ${compiler.config.get('lexer')?.value});`;
}
