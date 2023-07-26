import {serializeRules} from './utils.js';

/**
 * @param {import('../compile.js').Compiler} parser
 */
export function* cjs(parser) {
	yield `// Generated automatically by nearley, version ${parser.version}`;
	yield '// https://github.com/esdmr/nearley (fork of https://github.com/Hardmath123/nearley)';

	if (parser.config.get('ts_nocheck')) {
		yield '// @ts-nocheck';
	}

	yield `const nearley = require(${JSON.stringify(
		parser.config.get('nearley') ?? 'nearley',
	)});`;
	yield* parser.body;
	yield `module.exports = new nearley.Grammar(${serializeRules(
		parser.rules,
		parser.config.get('default_postprocess'),
	)}, ${JSON.stringify(parser.start)}, ${parser.config.get('lexer')});`;
}
