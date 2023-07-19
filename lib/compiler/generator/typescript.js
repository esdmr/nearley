import {serializeRules} from './utils.js';

/**
 * @param {import('../compile.js').Compiler} parser
 */
export function* typescript(parser) {
	yield `// Generated automatically by nearley, version ${parser.version}`;
	yield '// http://github.com/Hardmath123/nearley';

	if (parser.config.get('tsNoCheck')) {
		yield '// @ts-nocheck';
	}

	yield `import * as nearley from ${JSON.stringify(
		parser.config.get('nearley') ?? 'nearley',
	)};`;
	yield* parser.body;
	yield `export default new nearley.Grammar(${serializeRules(
		parser.rules,
	)}, ${JSON.stringify(parser.start)}, ${parser.config.get('lexer')});`;
}
