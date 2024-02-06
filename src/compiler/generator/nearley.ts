import type {Compiler} from '../compile.js';

export function* nearley(compiler: Compiler) {
	yield `# Generated automatically by nearley, version ${compiler.options.version}`;
	yield '# https://github.com/esdmr/nearley (fork of https://github.com/Hardmath123/nearley)';

	for (const item of compiler.body) {
		yield `@{%${item}%}`;
	}

	for (const config of compiler.config.values()) {
		yield config.toString();
	}

	for (const rule of compiler.rules) {
		yield rule.toString();
	}
}
