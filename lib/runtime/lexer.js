export class StreamLexer {
	buffer;
	index;
	line;
	lastLineBreak;

	constructor() {
		this.reset('');
	}

	reset(data, state) {
		this.buffer = data;
		this.index = 0;
		this.line = state ? state.line : 1;
		this.lastLineBreak = state ? -state.col : 0;
	}

	next() {
		if (this.index < this.buffer.length) {
			const ch = this.buffer[this.index++];
			if (ch === '\n') {
				this.line += 1;
				this.lastLineBreak = this.index;
			}

			return {value: ch};
		}
	}

	save() {
		return {
			line: this.line,
			col: this.index - this.lastLineBreak,
		};
	}

	formatError(token, message) {
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
						`${pad(this.line - lines.length + i + 1, lastLineDigits)} ${line}`,
				)
				.join('\n');
			message += `\n${pad('', lastLineDigits + col)}^\n`;
			return message;
		}

		return `${message} at index ${this.index - 1}`;

		function pad(n, length) {
			const s = String(n);
			return Array.from({length: length - s.length + 1}).join(' ') + s;
		}
	}
}
