import {State} from './state.js';
import {Parser} from './parser.js';

export class Column {
	lexerState;

	constructor(grammar, index) {
		this.grammar = grammar;
		this.index = index;
		this.states = [];
		this.wants = {}; // States indexed by the non-terminal they expect
		this.scannable = []; // List of states that expect a token
		this.completed = {}; // States that are nullable
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
						const left = wantedBy[i];
						this.complete(left, state);
					}

					// Special-case nullables
					if (state.reference === this.index) {
						// Make sure future predictors of this rule get completed.
						const exp = state.rule.name;
						(this.completed[exp] = this.completed[exp] || []).push(state);
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
				if (wants[exp]) {
					wants[exp].push(state);

					if (Object.prototype.hasOwnProperty.call(completed, exp)) {
						const nulls = completed[exp];

						// eslint-disable-next-line max-depth
						for (const right of nulls) {
							this.complete(state, right);
						}
					}
				} else {
					wants[exp] = [state];
					this.predict(exp);
				}
			}
		}
	}

	predict(exp) {
		const rules = this.grammar.byName[exp] || [];

		for (const r of rules) {
			const wantedBy = this.wants[exp];
			const s = new State(r, 0, this.index, wantedBy);
			this.states.push(s);
		}
	}

	complete(left, right) {
		const copy = left.nextState(right);
		this.states.push(copy);
	}
}
