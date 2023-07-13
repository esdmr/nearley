#!/usr/bin/env node

import fs from 'fs';
import process from 'process';
import * as nearley from '../lib/nearley.js';
import opts from 'commander';
import {compile} from '../lib/compile.js';
import {StreamWrapper} from '../lib/stream.js';
import bootstrap from '../lib/nearley-language-bootstrapped.js';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
opts.version(pkg.version, '-v, --version')
    .arguments('<file.ne>')
    .option('-o, --out [filename.js]', 'File to output to (defaults to stdout)', false)
    .option('-e, --export [name]', 'Variable to set parser to', 'grammar')
    .option('-q, --quiet', 'Suppress linter')
    .option('--nojs', 'Do not compile postprocessors')
    .parse(process.argv);


const input = opts.args[0] ? fs.createReadStream(opts.args[0]) : process.stdin;
/** @type {NodeJS.WritableStream} */
const output = opts.out ? fs.createWriteStream(opts.out) : process.stdout;

const parserGrammar = nearley.Grammar.fromCompiled(bootstrap);
const parser = new nearley.Parser(parserGrammar);
import {generate} from '../lib/generate.js';
import {lint} from '../lib/lint.js';

input
    .pipe(new StreamWrapper(parser))
    .on('finish', () => {
        parser.feed('\n');
        const c = compile(
            parser.results[0],
            Object.assign({version: pkg.version}, opts)
        );
        if (!opts.quiet) lint(c, {'out': process.stderr, 'version': pkg.version});
        output.write(generate(c, opts.export));
    });
