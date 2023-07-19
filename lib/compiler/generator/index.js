import {cjs} from './cjs.js';
import {esm} from './esm.js';
import {tsd} from './tsd.js';
import {typescript} from './typescript.js';

export const defaultGenerator = '_default';

export const generators = new Map([
	['require', cjs],
	['cjs', cjs],
	['commonjs', cjs],
	['esm', esm],
	['esmodule', esm],
	['import', esm],
	['module', esm],
	[defaultGenerator, esm],
	['typescript', typescript],
	['ts', typescript],
	['tsd', tsd],
]);
