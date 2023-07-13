#!/usr/bin/env node

import fs from 'fs';
import process from 'process';
import * as nearley from '../lib/nearley.js';
import opts from 'commander';
import {Compile} from '../lib/compile.js';
import {StreamWrapper} from '../lib/stream.js';
import pkg from '../package.json' assert {type: 'json'};
import bootstrap from '../lib/nearley-language-bootstrapped.js';

opts.version(pkg.version, '-v, --version')
    .arguments('<file.ne>')
    .option('-o, --out [filename.js]', 'File to output to (defaults to stdout)', false)
    .option('-e, --export [name]', 'Variable to set parser to', 'grammar')
    .option('-q, --quiet', 'Suppress linter')
    .option('--nojs', 'Do not compile postprocessors')
    .parse(process.argv);


const input = opts.args[0] ? fs.createReadStream(opts.args[0]) : process.stdin;
const output = opts.out ? fs.createWriteStream(opts.out) : process.stdout;

const parserGrammar = nearley.Grammar.fromCompiled(bootstrap);
const parser = new nearley.Parser(parserGrammar);
import {generate} from '../lib/generate.js';
import {lint} from '../lib/lint.js';

input
    .pipe(new StreamWrapper(parser))
    .on('finish', () => {
        parser.feed('\n');
        const c = Compile(
            parser.results[0],
            Object.assign({version: pkg.version}, opts)
        );
        if (!opts.quiet) lint(c, {'out': process.stderr, 'version': pkg.version});
        output.write(generate(c, opts.export));
    });
