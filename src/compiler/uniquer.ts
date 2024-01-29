export class Uniquer {
	readonly #count = new Map<string, number>();

	get(name: string) {
		const un = (this.#count.get(name) ?? 0) + 1;
		this.#count.set(name, un);
		return `${name}$${un}`;
	}
}
