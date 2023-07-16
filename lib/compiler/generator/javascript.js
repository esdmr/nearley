import {serializeRules} from './utils.js';

const builtinPostprocessors = {
	joiner: "function joiner(d) {return d.join('');}",
	arrconcat: 'function arrconcat(d) {return [d[0]].concat(d[1]);}',
	arrpush: 'function arrpush(d) {return d[0].concat([d[1]]);}',
	nuller: 'function() {return null;}',
	id: 'id',
};

export function javascript(parser, exportName) {
	let output = `// Generated automatically by nearley, version ${parser.version}\n`;
	output += '// http://github.com/Hardmath123/nearley\n';
	output += '(function () {\n';
	output += 'function id(x) { return x[0]; }\n';
	output += parser.body.join('\n');
	output += 'var grammar = {\n';
	output += `    Lexer: ${parser.config.lexer},\n`;
	output += `    ParserRules: ${serializeRules(
		parser.rules,
		builtinPostprocessors,
	)}\n`;
	output += `  , ParserStart: ${JSON.stringify(parser.start)}\n`;
	output += '}\n';
	output +=
		"if (typeof module !== 'undefined'" +
		"&& typeof module.exports !== 'undefined') {\n";
	output += '   module.exports = grammar;\n';
	output += '} else {\n';
	output += `   window.${exportName} = grammar;\n`;
	output += '}\n';
	output += '})();\n';
	return output;
}
