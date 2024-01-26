export type RuntimeSymbol = string | RegExp | LiteralSymbol | TokenSymbol;

export class LiteralSymbol {
	value;

	constructor(value: string) {
		Object.seal(this);
		this.value = value;
	}
}

export class TokenSymbol {
	token;

	constructor(token: string) {
		Object.seal(this);
		this.token = token;
	}
}
