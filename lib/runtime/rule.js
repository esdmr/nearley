export class Rule {
	constructor(name, symbols, postprocess) {
		this.id = ++Rule.highestId;
		this.name = name;
		this.symbols = symbols; // A list of literal | regex class | nonterminal
		this.postprocess = postprocess;
	}

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

Rule.highestId = 0;

function getSymbolShortDisplay(symbol) {
	const type = typeof symbol;
	if (type === 'string') {
		return symbol;
	}

	if (type === 'object') {
		if (symbol.literal) {
			return JSON.stringify(symbol.literal);
		}

		if (symbol instanceof RegExp) {
			return symbol.toString();
		}

		if (symbol.type) {
			return `%${symbol.type}`;
		}

		if (symbol.test) {
			return `<${String(symbol.test)}>`;
		}

		throw new Error(`Unknown symbol type: ${symbol}`);
	}
}
