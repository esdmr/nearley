/**
 * @template T
 * @param {readonly [T, ...any[]]} d
 * @returns {T}
 */
export function id(d) {
	return d[0];
}
