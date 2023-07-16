import {tabulateString, dedentFunc, serializeRules} from './utils.js';

const builtinPostprocessors = {
	joiner: "(d) -> d.join('')",
	arrconcat: '(d) -> [d[0]].concat(d[1])',
	arrpush: '(d) -> d[0].concat([d[1]])',
	nuller: '() -> null',
	id: 'id',
};

export function coffeescript(parser, exportName) {
	let output = `# Generated automatically by nearley, version ${parser.version}\n`;
	output += '# http://github.com/Hardmath123/nearley\n';
	output += 'do ->\n';
	output += '  id = (d) -> d[0]\n';
	output += `${tabulateString(dedentFunc(parser.body.join('\n')), '  ')}\n`;
	output += '  grammar = {\n';
	output += `    Lexer: ${parser.config.lexer},\n`;
	output += `    ParserRules: ${tabulateString(
		serializeRules(parser.rules, builtinPostprocessors),
		'      ',
		{indentFirst: false},
	)},\n`;
	output += `    ParserStart: ${JSON.stringify(parser.start)}\n`;
	output += '  }\n';
	output +=
		"  if typeof module != 'undefined' " +
		"&& typeof module.exports != 'undefined'\n";
	output += '    module.exports = grammar;\n';
	output += '  else\n';
	output += `    window.${exportName} = grammar;\n`;
	return output;
}
