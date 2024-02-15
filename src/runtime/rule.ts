import type {fail} from './fail.js';
import type {RuntimeSymbol} from './symbol.js';

export type PostProcessor = (
	d: any,
	ref?: number,
	error?: typeof fail,
	name?: string,
) => unknown;

let highestId = 0;

export class Rule {
	readonly id = ++highestId;
	readonly name;
	readonly symbols;
	readonly postprocess;

	constructor(
		name: string,
		symbols: readonly RuntimeSymbol[],
		postprocess?: PostProcessor,
	) {
		Object.seal(this);
		this.name = name;
		this.symbols = symbols;
		this.postprocess = postprocess;
	}

	toString(withCursorAt?: number) {
		const symbolSequence =
			withCursorAt === undefined
				? this.symbols.join(' ')
				: `${this.symbols.slice(0, withCursorAt).join(' ')} ● ${this.symbols
						.slice(withCursorAt)
						.join(' ')}`;
		return `${this.name} → ${symbolSequence}`;
	}
}
