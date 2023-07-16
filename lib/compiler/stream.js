// Node-only

import {Writable} from 'node:stream';

export class StreamWrapper extends Writable {
	constructor(parser) {
		super();
		this._parser = parser;
	}

	_write(chunk, _encoding, callback) {
		this._parser.feed(chunk.toString());
		callback();
	}
}
