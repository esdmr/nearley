import {LiteralSymbol, TokenSymbol, type RuntimeSymbol} from './symbol.js';

export type PostProcessor = (
	d: any,
	ref?: number,
	error?: Record<string, unknown>,
	name?: string,
) => unknown;

export class Rule {
	static highestId = 0;

	id = ++Rule.highestId;
	name;
	symbols;
	postprocess;

	constructor(
		name: string,
		symbols: readonly RuntimeSymbol[],
		postprocess?: PostProcessor,
	) {
		Object.seal(this);
		this.name = name;
		this.symbols = symbols; // A list of literal | regex class | nonterminal
		this.postprocess = postprocess;
	}

	toString(withCursorAt: number) {
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

function getSymbolShortDisplay(symbol: RuntimeSymbol) {
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

	throw new Error(`Unknown symbol type: (${typeof symbol}) ${String(symbol)}`);
}
