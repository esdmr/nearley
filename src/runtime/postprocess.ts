/**
 * @template T
 * @param {readonly [T, ...any[]]} d
 * @returns {T}
 */
export function id(d) {
	return d[0];
}

/**
 * @template T
 * @param {T} d
 * @param {unknown} [_a]
 * @param {unknown} [_b]
 * @param {string} [name]
 */
export function withName(d, _a, _b, name) {
	const array = /** @type {T & {name?: string}} */ (d);
	if (name) array.name = name;
	return array;
}
