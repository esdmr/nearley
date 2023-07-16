export class Uniquer {
	#count = {};

	get(name) {
		const un = (this.#count[name] || 0) + 1;
		this.#count[name] = un;
		return `${name}$${un}`;
	}
}
