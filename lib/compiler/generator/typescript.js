import {serializeRules} from './utils.js';

/**
 * @param {import('../compile.js').Compiler} parser
 */
export function* typescript(parser) {
	yield `// Generated automatically by nearley, version ${parser.version}`;
	yield '// http://github.com/Hardmath123/nearley';
	yield `import * as nearley from ${JSON.stringify(
		parser.config.get('nearley') ?? 'nearley',
	)};`;
	yield* parser.body;
	yield 'const grammar: nearley.CompiledGrammar = {';
	yield `\tLexer: ${parser.config.get('lexer')},`;
	yield `\tParserRules: ${serializeRules(parser.rules)},`;
	yield `\tParserStart: ${JSON.stringify(parser.start)},`;
	yield '};';
	yield 'export default grammar;';
}
