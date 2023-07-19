import {serializeRules} from './utils.js';

/**
 * @param {import('../compile.js').Compiler} parser
 */
export function* typescript(parser) {
	yield `// Generated automatically by nearley, version ${parser.version}`;
	yield '// http://github.com/Hardmath123/nearley';
	yield 'import * as nearley from "nearley";';
	yield* parser.body;
	yield 'interface NearleyToken {';
	yield '\tvalue: any;';
	yield '\t[key: string]: any;';
	yield '};';
	yield 'interface NearleyLexer {';
	yield '\treset: (chunk: string, info: any) => void;';
	yield '\tnext: () => NearleyToken | undefined;';
	yield '\tsave: () => any;';
	yield '\tformatError: (token: never) => string;';
	yield '};';
	yield 'interface NearleyRule {';
	yield '\tname: string;';
	yield '\tsymbols: NearleySymbol[];';
	yield '\tpostprocess?: (d: any, loc?: number, reject?: {}) => any;';
	yield '};';
	yield 'type NearleySymbol = string | { token: string } | { literal: any } | { test: (token: any) => boolean };\n';
	yield 'interface Grammar {';
	yield '\tLexer: NearleyLexer | undefined;';
	yield '\tParserRules: NearleyRule[];';
	yield '\tParserStart: string;';
	yield '};';
	yield 'const grammar: Grammar = {';
	yield `\tLexer: ${parser.config.get('lexer')},`;
	yield `\tParserRules: ${serializeRules(parser.rules)},`;
	yield `\tParserStart: ${JSON.stringify(parser.start)},`;
	yield '};';
	yield 'export default grammar;';
}
