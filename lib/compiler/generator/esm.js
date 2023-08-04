import {serializeRules} from './utils.js';

/**
 * @param {import('../compile.js').Compiler} parser
 */
export function* esm(parser) {
	yield `// Generated automatically by nearley, version ${parser.version}`;
	yield '// https://github.com/esdmr/nearley (fork of https://github.com/Hardmath123/nearley)';

	if (parser.config.get('ts_nocheck')?.toBoolean()) {
		yield '// @ts-nocheck';
	}

	yield `import * as nearley from ${JSON.stringify(
		parser.config.get('nearley')?.value ?? '@esdmr/nearley',
	)};`;
	yield* parser.body;
	yield `export default new nearley.Grammar(${serializeRules(
		parser.rules,
		parser.config.get('default_postprocess')?.value,
	)}, ${JSON.stringify(parser.start)}, ${parser.config.get('lexer')});`;
}
