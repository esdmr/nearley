/**
 * @typedef {import('moo').Token} MooToken
 * @implements {MooToken}
 */
export class StreamLexerToken {
	text;
	offset;
	lineBreaks;
	line;
	col;

	get value() {
		return this.text;
	}

	/**
	 * @param {string} text
	 * @param {number} offset
	 * @param {number} line
	 * @param {number} col
	 */
	constructor(text, offset, line, col) {
		Object.seal(this);
		this.text = text;
		this.lineBreaks = text === '\n' ? 1 : 0;
		this.offset = offset;
		this.line = line;
		this.col = col;
	}

	toString() {
		return this.text;
	}
}

/**
 * @typedef {import('moo').LexerState} MooState
 * @implements {MooState}
 */
export class StreamLexerState {
	line;
	col;
	state = '';

	/**
	 * @param {number} line
	 * @param {number} col
	 */
	constructor(line, col) {
		Object.seal(this);
		this.line = line;
		this.col = col;
	}
}

/**
 * @typedef {import('moo').Lexer} MooLexer
 * @implements {MooLexer}
 */
export class StreamLexer {
	/** @type {string} */
	buffer = '';
	/** @type {number} */
	index = 0;
	/** @type {number} */
	line = 1;
	/** @type {number} */
	lastLineBreak = 0;

	constructor() {
		Object.seal(this);
	}

	/**
	 * @param {string} data
	 * @param {StreamLexerState} [state]
	 */
	reset(data, state) {
		this.buffer = data;
		this.index = 0;
		this.line = state ? state.line : 1;
		this.lastLineBreak = state ? -state.col : 0;
		return this;
	}

	next() {
		if (this.index >= this.buffer.length) {
			return;
		}

		const ch = /** @type {string} */ (this.buffer[this.index++]);

		const token = new StreamLexerToken(
			ch,
			this.index,
			this.line,
			this.index - this.lastLineBreak,
		);

		if (ch === '\n') {
			this.line += 1;
			this.lastLineBreak = this.index;
		}

		return token;
	}

	save() {
		return new StreamLexerState(this.line, this.index - this.lastLineBreak);
	}

	*[Symbol.iterator]() {
		/** @type {StreamLexerToken | undefined} */
		let token;

		while ((token = this.next())) {
			yield token;
		}
	}

	/** @returns {never} */
	has() {
		throw new Error('StreamLexer has no token types');
	}

	/** @returns {never} */
	pushState() {
		throw new Error('StreamLexer has no state');
	}

	/** @returns {never} */
	popState() {
		throw new Error('StreamLexer has no state');
	}

	/** @returns {never} */
	setState() {
		throw new Error('StreamLexer has no state');
	}

	/**
	 * @param {unknown} _token
	 * @param {string} message
	 */
	formatError(_token, message) {
		// Nb. this gets called after consuming the offending token,
		// so the culprit is index-1
		const buffer = this.buffer;
		if (typeof buffer === 'string') {
			const lines = buffer
				.split('\n')
				.slice(Math.max(0, this.line - 5), this.line);

			let nextLineBreak = buffer.indexOf('\n', this.index);
			if (nextLineBreak === -1) {
				nextLineBreak = buffer.length;
			}

			const col = this.index - this.lastLineBreak;
			const lastLineDigits = String(this.line).length;
			message += ` at line ${this.line} col ${col}:\n\n`;
			message += lines
				.map(
					(line, i) =>
						`${String(this.line - lines.length + i + 1).padStart(
							lastLineDigits,
						)} ${line}`,
				)
				.join('\n');
			message += `\n${''.padStart(lastLineDigits + col)}^\n`;
			return message;
		}

		return `${message} at index ${this.index - 1}`;
	}
}
