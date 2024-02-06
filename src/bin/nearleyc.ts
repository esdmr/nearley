#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';
import assert from 'node:assert';
import url from 'node:url';
import {Command} from '@commander-js/extra-typings';
import {Compiler} from '../compiler/compile.js';
import {generate} from '../compiler/generate.js';
import {lint} from '../compiler/lint.js';
import bootstrap from '../compiler/grammar/index.js';
import {Parser} from '../runtime/parser.js';
import type {Node} from '../compiler/ast.js';
import {optimize} from '../compiler/optimize.js';

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
	.option('-O, --optimize', 'combine equal rules')
	.parse(process.argv);

const options = {
	...program.opts(),
	args: program.processedArgs,
	version: pkg.version,
};

const input =
	options.args[0] === '-'
		? process.stdin
		: fs.createReadStream(options.args[0]);

input.setEncoding('utf8');

const parser = new Parser(bootstrap);
await parser.feedFrom(input);
parser.feed('\n');

const c = new Compiler({
	version: options.version,
	quiet: options.quiet ?? false,
	readFile: (path) => fs.readFileSync(path, 'utf8'),
});

c.compile(
	parser.results[0] as Node[],
	url.pathToFileURL(
		options.args[0] === '-' ? `${process.cwd()}/` : options.args[0],
	),
);

if (!options.quiet) {
	lint(c);
}

if (options.optimize) {
	optimize(c);
}

const output: NodeJS.WritableStream =
	typeof options.out === 'string'
		? fs.createWriteStream(options.out)
		: process.stdout;

for (const line of generate(c)) {
	output.write(`${line}\n`);
}
