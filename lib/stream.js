// Node-only

import {Writable} from 'stream';

export class StreamWrapper extends Writable {
    constructor(parser) {
        super();
        this._parser = parser;
    }

    _write(chunk, encoding, callback) {
        this._parser.feed(chunk.toString());
        callback();
    }
}
