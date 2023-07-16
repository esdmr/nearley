export class ParserError extends Error {
	name = 'ParserError';
	offset;
	token;
}

export class LexerError extends ParserError {
	name = 'LexerError';
}
