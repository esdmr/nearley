import {LiteralSymbol, TokenSymbol} from './symbol.js';

/**
 * @typedef {(d: unknown[], ref?: number, error?: {}) => unknown} PostProcessor
 */
export class Rule {
	static highestId = 0;

	id = ++Rule.highestId;
	name;
	symbols;
	postprocess;

	/**
	 * @param {string} name
	 * @param {import('./symbol.js').RuntimeSymbol[]} symbols
	 * @param {PostProcessor} [postprocess]
	 */
	constructor(name, symbols, postprocess) {
		Object.seal(this);
		this.name = name;
		this.symbols = symbols; // A list of literal | regex class | nonterminal
		this.postprocess = postprocess;
	}

	/** @param {number} withCursorAt */
	toString(withCursorAt) {
		const symbolSequence =
			withCursorAt === undefined
				? this.symbols.map((s) => getSymbolShortDisplay(s)).join(' ')
				: `${this.symbols
						.slice(0, withCursorAt)
						.map((s) => getSymbolShortDisplay(s))
						.join(' ')} ● ${this.symbols
						.slice(withCursorAt)
						.map((s) => getSymbolShortDisplay(s))
						.join(' ')}`;
		return `${this.name} → ${symbolSequence}`;
	}
}

/** @param {import('./symbol.js').RuntimeSymbol} symbol */
function getSymbolShortDisplay(symbol) {
	if (typeof symbol === 'string') {
		return symbol;
	}

	if (symbol instanceof LiteralSymbol) {
		return JSON.stringify(symbol.value);
	}

	if (symbol instanceof RegExp) {
		return symbol.toString();
	}

	if (symbol instanceof TokenSymbol) {
		return `%${symbol.token}`;
	}

	throw new Error(`Unknown symbol type: ${symbol}`);
}
