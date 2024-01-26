export class ParserError extends Error {
	override name = 'ParserError';
	offset;
	token;

	constructor(
		offset: number,
		token: unknown,
		...args: Parameters<ErrorConstructor>
	) {
		super(...args);
		this.offset = offset;
		this.token = token;
	}
}

export class LexerError extends ParserError {
	override name = 'LexerError';
}
