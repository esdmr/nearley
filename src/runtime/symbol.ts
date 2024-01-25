/**
 * @typedef {string | RegExp
 *     | LiteralSymbol
 *     | TokenSymbol
 * } RuntimeSymbol
 */

export class LiteralSymbol {
	value;

	/** @param {string} value */
	constructor(value) {
		Object.seal(this);
		this.value = value;
	}
}

export class TokenSymbol {
	token;

	/** @param {string} token */
	constructor(token) {
		Object.seal(this);
		this.token = token;
	}
}
