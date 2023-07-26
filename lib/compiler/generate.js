import {defaultGenerator, generators} from './generator/index.js';

/**
 * @param {import('./compile.js').Compiler} parser
 */
export function generate(parser) {
	const preprocessor =
		parser.config.get('preprocessor')?.value || defaultGenerator;
	const generator = generators.get(preprocessor);

	if (!generator) {
		throw new Error(`No such preprocessor: ${preprocessor}`);
	}

	return generator(parser);
}
