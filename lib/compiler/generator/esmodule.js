import {builtinPostprocessors} from './typescript.js';
import {serializeRules} from './utils.js';

export function esmodule(parser) {
	let output = `// Generated automatically by nearley, version ${parser.version}\n`;
	output += '// http://github.com/Hardmath123/nearley\n';
	output += 'function id(x) { return x[0]; }\n';
	output += parser.body.join('\n');
	output += `const Lexer = ${parser.config.lexer};\n`;
	output += `const ParserRules = ${serializeRules(
		parser.rules,
		builtinPostprocessors,
	)};\n`;
	output += `const ParserStart = ${JSON.stringify(parser.start)};\n`;
	output += 'const grammar = {Lexer, ParserRules, ParserStart};\n';
	output += 'export default grammar;\n';
	return output;
}
