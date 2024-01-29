// Node-only

import {Writable} from 'node:stream';
import type {Parser} from '../runtime/parser.js';

export class StreamWrapper extends Writable {
	readonly #parser;

	constructor(parser: Parser) {
		super();
		this.#parser = parser;
	}

	override _write(chunk: unknown, _encoding: unknown, callback: () => void) {
		this.#parser.feed(String(chunk));
		callback();
	}
}
