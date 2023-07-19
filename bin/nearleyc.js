#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';
import {Command} from '@commander-js/extra-typings';
import {compile} from '../lib/compiler/compile.js';
import {generate} from '../lib/compiler/generate.js';
import {lint} from '../lib/compiler/lint.js';
import bootstrap from '../lib/compiler/nearley-language-bootstrapped.js';
import {StreamWrapper} from '../lib/compiler/stream.js';
import {Parser} from '../lib/runtime/parser.js';

const pkg = JSON.parse(
	fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
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

/** @typedef {typeof options} NearleyOptions */
// eslint-disable-next-line @internal/no-object-literals
const options = {...program.opts(), args: program.args, version: pkg.version};

const input = options.args[0]
	? fs.createReadStream(options.args[0])
	: process.stdin;

/** @type {NodeJS.WritableStream} */
const output =
	typeof options.out === 'string'
		? fs.createWriteStream(options.out)
		: process.stdout;
const parser = Parser.fromCompiledGrammar(bootstrap);

input.pipe(new StreamWrapper(parser)).on('finish', () => {
	parser.feed('\n');
	const c = compile(
		/** @type {import('../lib/compiler/ast.js').Node[]} */ (parser.results[0]),
		options,
	);

	if (!options.quiet) {
		lint(c);
	}

	for (const line of generate(c)) {
		output.write(line + '\n');
	}
});
