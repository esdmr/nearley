/**
 * @typedef {import('../runtime/symbol.js').RuntimeSymbol
 *     | MacroParameterSymbol
 *     | MacroCallSymbol
 *     | EbnfSymbol
 *     | SubExpressionSymbol
 * } CompilerSymbol
 */

export * from '../runtime/symbol.js';

export class MacroParameterSymbol {
	name;

	/**
	 * @param {string} name
	 */
	constructor(name) {
		Object.seal(this);
		this.name = name;
	}
}

export class MacroCallSymbol {
	name;
	args;

	/**
	 * @param {string} name
	 * @param {import('./ast.js').Expression[]} args
	 */
	constructor(name, args) {
		Object.seal(this);
		this.name = name;
		this.args = args;
	}
}

export class EbnfSymbol {
	static star = '*';
	static plus = '+';
	static opt = '?';

	expression;
	modifier;

	/**
	 * @param {CompilerSymbol} expression
	 * @param {string} modifier
	 */
	constructor(expression, modifier) {
		Object.seal(this);
		this.expression = expression;
		this.modifier = modifier;
	}
}

export class SubExpressionSymbol {
	expression;

	/**
	 * @param {import('./ast.js').Expression[]} expression
	 */
	constructor(expression) {
		Object.seal(this);
		this.expression = expression;
	}
}
