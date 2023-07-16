import {defaultGenerator, generators} from './generator/index.js';

export function generate(parser, exportName) {
	parser.config.preprocessor ||= defaultGenerator;

	if (!generators[parser.config.preprocessor]) {
		throw new Error(`No such preprocessor: ${parser.config.preprocessor}`);
	}

	return generators[parser.config.preprocessor](parser, exportName);
}
