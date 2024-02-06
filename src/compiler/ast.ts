import type {RuntimeSymbol} from '../runtime/symbol.js';
import {
	type BuiltinPostprocessor,
	serializePostprocess,
} from './generator/utils.js';
import type {CompilerSymbol} from './symbol.js';

export type Node =
	| Production
	| MacroDefinition
	| Config
	| Include
	| RawSourceCode;

export class Rule {
	name;
	readonly symbols;
	postprocess;

	constructor(
		name: string,
		symbols: RuntimeSymbol[],
		postprocess?: RawSourceCode | BuiltinPostprocessor,
	) {
		Object.seal(this);
		this.name = name;
		this.symbols = symbols;
		this.postprocess = postprocess;
	}

	toString() {
		const postprocess = serializePostprocess(this.postprocess);
		return `${this.name} -> ${this.symbols.join(' ') || 'null'}${postprocess ? ` {%${postprocess}%}` : ''}`;
	}
}

export class Expression {
	readonly symbols;
	readonly postprocess;

	constructor(
		symbols: ReadonlyArray<CompilerSymbol | undefined>,
		postprocess?: RawSourceCode | BuiltinPostprocessor,
	) {
		Object.seal(this);
		this.symbols = symbols.filter((i): i is CompilerSymbol => i !== undefined);
		this.postprocess = postprocess;
	}

	toString() {
		return `${this.symbols.join(' ')} ${serializePostprocess(this.postprocess) ?? ''}`;
	}
}

export class Production {
	readonly name;
	readonly expressions;

	constructor(name: string, expressions: readonly Expression[]) {
		Object.seal(this);
		this.name = name;
		this.expressions = expressions;
	}

	toString() {
		return (
			this.expressions
				.map((i) => `${this.name} -> ${i.toString()}`)
				.join('\n') || `# Empty production ${this.name}`
		);
	}
}

export class RawSourceCode {
	readonly source;

	constructor(source: string) {
		Object.seal(this);
		this.source = source;
	}

	toString() {
		return this.source;
	}
}

export class Include {
	readonly path;

	constructor(path: string) {
		Object.seal(this);
		this.path = path;
	}

	toString() {
		return `@include ${JSON.stringify(this.path)}`;
	}
}

export class Config {
	readonly name;
	readonly value;

	constructor(name: string, value: string) {
		Object.seal(this);
		this.name = name;
		this.value = value;
	}

	asBoolean() {
		switch (this.value.trim().toLowerCase()) {
			case 'n':
			case 'no':
			case 'off':
			case 'false': {
				return false;
			}

			case 'y':
			case 'yes':
			case 'on':
			case 'true': {
				return true;
			}

			default: {
				throw new Error(
					`Config ${JSON.stringify(this.name)}: cannot convert ${JSON.stringify(
						this.value,
					)} to boolean`,
				);
			}
		}
	}

	toString() {
		return `@${this.name} ${JSON.stringify(this.value)}`;
	}
}

export class MacroDefinition {
	readonly name;
	readonly parameters;
	readonly expression;

	constructor(
		name: string,
		parameters: readonly string[],
		expression: readonly Expression[],
	) {
		Object.seal(this);
		this.name = name;
		this.parameters = parameters;
		this.expression = expression;
	}

	toString() {
		return `${this.name}[${this.parameters.join(', ')}] -> ${this.expression.join(' | ')}`;
	}
}
