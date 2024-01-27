import type {CompilerSymbol, RuntimeSymbol} from './symbol.js';

export type Node =
	| Production
	| MacroDefinition
	| Config
	| Include
	| RawSourceCode;

export class Rule {
	name;
	symbols;
	postprocess;
	/** Specific to tsd generator */
	postprocessProcessed = false;

	constructor(
		name: string,
		symbols: RuntimeSymbol[],
		postprocess?: RawSourceCode | string,
	) {
		Object.seal(this);
		this.name = name;
		this.symbols = symbols;
		this.postprocess = postprocess;
	}
}

export class Expression {
	symbols;
	postprocess;

	constructor(
		symbols: readonly CompilerSymbol[],
		postprocess?: RawSourceCode | string,
	) {
		Object.seal(this);
		this.symbols = symbols;
		this.postprocess = postprocess;
	}
}

export class Production {
	name;
	expressions;

	constructor(name: string, expressions: readonly Expression[]) {
		Object.seal(this);
		this.name = name;
		this.expressions = expressions;
	}
}

export class RawSourceCode {
	source;

	constructor(source: string) {
		Object.seal(this);
		this.source = source;
	}

	toString() {
		return this.source;
	}
}

export class Include {
	path;

	constructor(path: string) {
		Object.seal(this);
		this.path = path;
	}
}

export class Config {
	name;
	value;

	constructor(name: string, value: string) {
		Object.seal(this);
		this.name = name;
		this.value = value;
	}

	toBoolean() {
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
		return this.value;
	}
}

export class MacroDefinition {
	name;
	parameters;
	expression;

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
}
