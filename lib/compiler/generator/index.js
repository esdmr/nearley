import {coffeescript} from './coffeescript.js';
import {esmodule} from './esmodule.js';
import {javascript} from './javascript.js';
import {tsd} from './tsd.js';
import {typescript} from './typescript.js';

export const defaultGenerator = '_default';

export const generators = {
	javascript,
	js: javascript,
	esmodule,
	module: esmodule,
	[defaultGenerator]: esmodule,
	coffeescript,
	coffee: coffeescript,
	cs: coffeescript,
	typescript,
	ts: typescript,
	tsd,
};
