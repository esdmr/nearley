import type {Compiler} from './compile.js';
import {defaultGenerator, generators} from './generator/index.js';

export function generate(compiler: Compiler) {
	const preprocessor =
		compiler.config.get('preprocessor')?.value ?? defaultGenerator;
	const generator = generators.get(preprocessor);

	if (!generator) {
		throw new Error(`No such preprocessor: ${JSON.stringify(preprocessor)}`);
	}

	return generator(compiler);
}
