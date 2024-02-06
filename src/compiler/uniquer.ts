export class Uniquer {
	readonly #count = new Map<string, number>();

	constructor() {
		Object.seal(this);
	}

	get(name: string) {
		const un = (this.#count.get(name) ?? 0) + 1;
		this.#count.set(name, un);
		return `${name}$${un}`;
	}
}
