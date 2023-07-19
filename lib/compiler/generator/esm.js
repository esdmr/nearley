import {serializeRules} from './utils.js';

/**
 * @param {import('../compile.js').Compiler} parser
 */
export function* esm(parser) {
	yield `// Generated automatically by nearley, version ${parser.version}`;
	yield '// http://github.com/Hardmath123/nearley';
	yield '// @ts-nocheck';
	yield `import * as nearley from ${JSON.stringify(
		parser.config.get('nearley') ?? 'nearley',
	)};`;
	yield* parser.body;
	yield `const Lexer = ${parser.config.get('lexer')};`;
	yield `const ParserRules = ${serializeRules(parser.rules)};`;
	yield `const ParserStart = ${JSON.stringify(parser.start)};`;
	yield 'const grammar = {Lexer, ParserRules, ParserStart};';
	yield 'export default grammar;';
}
