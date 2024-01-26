import type {Lexer, LexerState, Token} from 'moo';

export class StreamLexerToken implements Token {
	text;
	offset;
	lineBreaks;
	line;
	col;

	get value() {
		return this.text;
	}

	constructor(text: string, offset: number, line: number, col: number) {
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

export class StreamLexerState implements LexerState {
	line;
	col;
	state = '';

	constructor(line: number, col: number) {
		Object.seal(this);
		this.line = line;
		this.col = col;
	}
}

export class StreamLexer implements Lexer {
	buffer = '';
	index = 0;
	line = 1;
	lastLineBreak = 0;

	constructor() {
		Object.seal(this);
	}

	reset(data: string, state?: StreamLexerState) {
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

		const ch = this.buffer[this.index++]!;

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
		let token: StreamLexerToken | undefined;

		while ((token = this.next())) {
			yield token;
		}
	}

	has(): never {
		throw new Error('StreamLexer has no token types');
	}

	pushState(): never {
		throw new Error('StreamLexer has no state');
	}

	popState(): never {
		throw new Error('StreamLexer has no state');
	}

	setState(): never {
		throw new Error('StreamLexer has no state');
	}

	formatError(_token: unknown, message: string) {
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
