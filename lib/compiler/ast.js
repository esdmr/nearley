/**
 * @typedef {Production | MacroDefinition | Config | Include | RawSourceCode} Node
 */

export class Rule {
	name;
	symbols;
	postprocess;
	/** Specific to tsd generator */
	postprocessProcessed = false;

	/**
	 * @param {string} name
	 * @param {import('../runtime/symbol.js').RuntimeSymbol[]} symbols
	 * @param {RawSourceCode | string} [postprocess]
	 */
	constructor(name, symbols, postprocess) {
		Object.seal(this);
		this.name = name;
		this.symbols = symbols;
		this.postprocess = postprocess;
	}
}

export class Expression {
	symbols;
	postprocess;

	/**
	 * @param {import('./symbol.js').CompilerSymbol[]} symbols
	 * @param {RawSourceCode | string} [postprocess]
	 */
	constructor(symbols, postprocess) {
		Object.seal(this);
		this.symbols = symbols;
		this.postprocess = postprocess;
	}
}

export class Production {
	name;
	expressions;

	/**
	 * @param {string} name
	 * @param {Expression[]} expressions
	 */
	constructor(name, expressions) {
		Object.seal(this);
		this.name = name;
		this.expressions = expressions;
	}
}

export class RawSourceCode {
	source;

	/**
	 * @param {string} source
	 */
	constructor(source) {
		Object.seal(this);
		this.source = source;
	}

	toString() {
		return this.source;
	}
}

export class Include {
	path;

	/**
	 * @param {string} path
	 */
	constructor(path) {
		Object.seal(this);
		this.path = path;
	}
}

export class Config {
	name;
	value;

	/**
	 * @param {string} name
	 * @param {string} value
	 */
	constructor(name, value) {
		Object.seal(this);
		this.name = name;
		this.value = value;
	}
}

export class MacroDefinition {
	name;
	parameters;
	expression;

	/**
	 * @param {string} name
	 * @param {string[]} parameters
	 * @param {Expression[]} expression
	 */
	constructor(name, parameters, expression) {
		Object.seal(this);
		this.name = name;
		this.parameters = parameters;
		this.expression = expression;
	}
}
