import {State} from './state.js';
import {Parser} from './parser.js';

export class Column {
	/** @type {import('moo').LexerState | undefined} */
	lexerState;
	grammar;
	index;
	/** @type {State[]} */
	states = [];
	wants = new Map(); // States indexed by the non-terminal they expect
	/** @type {State[]} */
	scannable = []; // List of states that expect a token
	/** @type {Map<string, State[]>} */
	completed = new Map(); // States that are nullable

	/**
	 * @param {import('./grammar.js').Grammar} grammar
	 * @param {number} index
	 */
	constructor(grammar, index) {
		Object.seal(this);
		this.grammar = grammar;
		this.index = index;
	}

	process() {
		const states = this.states;
		const wants = this.wants;
		const completed = this.completed;

		// Nb. we push() during iteration
		for (const state of states) {
			if (state.isComplete) {
				state.finish();
				if (state.data !== Parser.fail) {
					// Complete
					const wantedBy = state.wantedBy;
					for (let i = wantedBy.length; i--; ) {
						// This line is hot
						const left = /** @type {State} */ (wantedBy[i]);
						this.complete(left, state);
					}

					// Special-case nullables
					if (state.reference === this.index) {
						// Make sure future predictors of this rule get completed.
						const exp = state.rule.name;

						// eslint-disable-next-line max-depth
						if (completed.has(exp)) {
							/** @type {State[]} */ (completed.get(exp)).push(
								state,
							);
						} else {
							completed.set(exp, [state]);
						}
					}
				}
			} else {
				// Queue scannable states
				const exp = state.rule.symbols[state.dot];
				if (typeof exp !== 'string') {
					this.scannable.push(state);
					continue;
				}

				// Predict
				if (wants.get(exp)) {
					wants.get(exp).push(state);

					if (completed.has(exp)) {
						const nulls = /** @type {State[]} */ (
							completed.get(exp)
						);

						// eslint-disable-next-line max-depth
						for (const right of nulls) {
							this.complete(state, right);
						}
					}
				} else {
					wants.set(exp, [state]);
					this.predict(exp);
				}
			}
		}
	}

	/** @param {string} exp */
	predict(exp) {
		const rules = this.grammar.byName.get(exp) || [];

		for (const r of rules) {
			const wantedBy = this.wants.get(exp);
			const s = new State(r, 0, this.index, wantedBy);
			this.states.push(s);
		}
	}

	/**
	 * @param {State} left
	 * @param {State | import('./state.js').StateChild} right
	 */
	complete(left, right) {
		const copy = left.nextState(right);
		this.states.push(copy);
	}
}
