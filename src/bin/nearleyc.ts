#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';
import assert from 'node:assert';
import {Command} from '@commander-js/extra-typings';
import {compile} from '../compiler/compile.js';
import {generate} from '../compiler/generate.js';
import {lint} from '../compiler/lint.js';
import bootstrap from '../compiler/grammar/index.js';
import {StreamWrapper} from '../compiler/stream.js';
import {Parser} from '../runtime/parser.js';
import type {Node} from '../compiler/ast.js';

const pkg: unknown = JSON.parse(
	fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
);

assert(
	typeof pkg === 'object' &&
		pkg &&
		'version' in pkg &&
		typeof pkg.version === 'string',
);

const program = new Command()
	.version(pkg.version, '-v, --version')
	.arguments('<file.ne>')
	.option(
		'-o, --out [filename.js]',
		'File to output to (defaults to stdout)',
		false,
	)
	.option('-q, --quiet', 'Suppress linter')
	.option('--nojs', 'Do not compile postprocessors')
	.option('-O, --optimize', 'combine equal rules')
	.parse(process.argv);

export type NearleyOptions = typeof options;

const options = {...program.opts(), args: program.args, version: pkg.version};

const input = options.args[0]
	? fs.createReadStream(options.args[0])
	: process.stdin;

const output: NodeJS.WritableStream =
	typeof options.out === 'string'
		? fs.createWriteStream(options.out)
		: process.stdout;
const parser = new Parser(bootstrap);

input.pipe(new StreamWrapper(parser)).on('finish', () => {
	parser.feed('\n');
	const c = compile(parser.results[0] as Node[], options);

	if (!options.quiet) {
		lint(c);
	}

	for (const line of generate(c)) {
		output.write(line + '\n');
	}
});
