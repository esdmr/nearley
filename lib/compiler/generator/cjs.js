import {serializeRules} from './utils.js';

/**
 * @param {import('../compile.js').Compiler} parser
 */
export function* cjs(parser) {
	yield `// Generated automatically by nearley, version ${parser.version}`;
	yield '// http://github.com/Hardmath123/nearley';
	yield `const nearley = require(${JSON.stringify(
		parser.config.get('nearley') ?? 'nearley',
	)});`;
	yield* parser.body;
	yield 'const grammar = {';
	yield `\tLexer: ${parser.config.get('lexer')},`;
	yield `\tParserRules: ${serializeRules(parser.rules)},`;
	yield `\tParserStart: ${JSON.stringify(parser.start)},`;
	yield '};';
	yield 'module.exports = grammar;';
}
