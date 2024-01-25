export class ParserError extends Error {
	/** @override */
	name = 'ParserError';
	offset;
	token;

	/**
	 *
	 * @param {number} offset
	 * @param {unknown} token
	 * @param  {Parameters<ErrorConstructor>} args
	 */
	constructor(offset, token, ...args) {
		super(...args);
		this.offset = offset;
		this.token = token;
	}
}

export class LexerError extends ParserError {
	/** @override */
	name = 'LexerError';
}
