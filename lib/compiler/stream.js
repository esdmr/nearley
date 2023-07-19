// Node-only

import {Writable} from 'node:stream';

export class StreamWrapper extends Writable {
	/** @param {import("../runtime/parser.js").Parser} parser */
	constructor(parser) {
		super();
		this._parser = parser;
	}

	/**
	 * @override
	 * @param {unknown} chunk
	 * @param {unknown} _encoding
	 * @param {() => void} callback
	 */
	_write(chunk, _encoding, callback) {
		this._parser.feed(String(chunk));
		callback();
	}
}
