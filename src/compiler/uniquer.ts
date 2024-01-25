export class Uniquer {
	#count = new Map();

	/** @param {string} name */
	get(name) {
		const un = (this.#count.get(name) || 0) + 1;
		this.#count.set(name, un);
		return `${name}$${un}`;
	}
}
