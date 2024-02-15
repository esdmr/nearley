export type RuntimeSymbol =
	| NonterminalSymbol
	| RegExpSymbol
	| LiteralSymbol
	| TokenSymbol;

export class NonterminalSymbol {
	readonly name;

	constructor(name: string) {
		Object.seal(name);
		this.name = name;
	}

	toString() {
		return this.name;
	}
}

export class RegExpSymbol {
	readonly pattern;

	constructor(pattern: RegExp) {
		Object.seal(pattern);
		this.pattern = pattern;
	}

	toString(type?: 'long') {
		return type
			? `character matching ${this.pattern.source}`
			: this.pattern.source;
	}
}

export class LiteralSymbol {
	readonly value;

	constructor(value: string) {
		Object.seal(this);
		this.value = value;
	}

	toString() {
		return JSON.stringify(this.value);
	}
}

export class TokenSymbol {
	readonly token;

	constructor(token: string) {
		Object.seal(this);
		this.token = token;
	}

	toString(type?: 'long') {
		return type ? `${this.token} token` : `%${this.token}`;
	}
}
