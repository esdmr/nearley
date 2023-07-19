import {serializeRules} from './utils.js';

/**
 * @param {import('../compile.js').Compiler} parser
 */
export function* cjs(parser) {
	yield `// Generated automatically by nearley, version ${parser.version}`;
	yield '// http://github.com/Hardmath123/nearley';

	if (parser.config.get('tsNoCheck')) {
		yield '// @ts-nocheck';
	}

	yield `const nearley = require(${JSON.stringify(
		parser.config.get('nearley') ?? 'nearley',
	)});`;
	yield* parser.body;
	yield `module.exports = new nearley.Grammar(${serializeRules(
		parser.rules,
	)}, ${JSON.stringify(parser.start)}, ${parser.config.get('lexer')});`;
}
