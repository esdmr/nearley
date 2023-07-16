import {serializeRules} from './utils.js';

export const builtinPostprocessors = {
	joiner: "(d) => d.join('')",
	arrconcat: '(d) => [d[0],...d[1]]',
	arrpush: '(d) => [...d[0],d[1]]',
	nuller: '(_) => null',
	id: 'id',
};

export function typescript(parser) {
	let output = `// Generated automatically by nearley, version ${parser.version}\n`;
	output += '// http://github.com/Hardmath123/nearley\n';
	output += '// Bypasses TS6133. Allow declared but unused functions.\n';
	output += '// @ts-ignore\n';
	output += 'function id<T>(d: readonly [T, ...any[]]): T { return d[0]; }\n';
	output += parser.customTokens
		.map((token) => `declare let ${token}: any;\n`)
		.join('');
	output += parser.body.join('\n');
	output += '\n';
	output += 'interface NearleyToken {\n';
	output += '  value: any;\n';
	output += '  [key: string]: any;\n';
	output += '};\n';
	output += '\n';
	output += 'interface NearleyLexer {\n';
	output += '  reset: (chunk: string, info: any) => void;\n';
	output += '  next: () => NearleyToken | undefined;\n';
	output += '  save: () => any;\n';
	output += '  formatError: (token: never) => string;\n';
	output += '  has: (tokenType: string) => boolean;\n';
	output += '};\n';
	output += '\n';
	output += 'interface NearleyRule {\n';
	output += '  name: string;\n';
	output += '  symbols: NearleySymbol[];\n';
	output += '  postprocess?: (d: any, loc?: number, reject?: {}) => any;\n';
	output += '};\n';
	output += '\n';
	output +=
		'type NearleySymbol = string | { type: string } | { literal: any } | { test: (token: any) => boolean };\n';
	output += '\n';
	output += 'interface Grammar {\n';
	output += '  Lexer: NearleyLexer | undefined;\n';
	output += '  ParserRules: NearleyRule[];\n';
	output += '  ParserStart: string;\n';
	output += '};\n';
	output += '\n';
	output += 'const grammar: Grammar = {\n';
	output += `  Lexer: ${parser.config.lexer},\n`;
	output += `  ParserRules: ${serializeRules(
		parser.rules,
		builtinPostprocessors,
		'  ',
	)},\n`;
	output += `  ParserStart: ${JSON.stringify(parser.start)},\n`;
	output += '};\n';
	output += '\n';
	output += 'export default grammar;\n';

	return output;
}
