// Node-only
import process from 'process';

const warn = ({out}, str) => {
    out.write(`WARN\t${str}\n`);
};

function lintNames({rules}, opts) {
    const all = [];
    rules.forEach(({name}) => {
        all.push(name);
    });
    rules.forEach(({symbols}) => {
        symbols.forEach(symbol => {
            if (!symbol.literal && !symbol.token && symbol.constructor !== RegExp) {
                if (!all.includes(symbol)) {
                    warn(opts,`Undefined symbol \`${symbol}\` used.`);
                }
            }
        });
    });
}

export function lint(grm, opts) {
    if (!opts.out) opts.out = process.stderr;
    lintNames(grm, opts);
}
