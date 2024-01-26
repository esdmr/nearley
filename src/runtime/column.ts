import type {LexerState} from 'moo';
import {State, type StateChild} from './state.js';
import {Parser} from './parser.js';
import type {Grammar} from './grammar.js';

export class Column {
	lexerState: LexerState | undefined;
	grammar;
	index;
	states: State[] = [];
	wants = new Map<string, State[]>(); // States indexed by the non-terminal they expect
	scannable: State[] = []; // List of states that expect a token
	completed = new Map<string, State[]>(); // States that are nullable

	constructor(grammar: Grammar, index: number) {
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
						const left = wantedBy[i]!;
						this.complete(left, state);
					}

					// Special-case nullables
					if (state.reference === this.index) {
						// Make sure future predictors of this rule get completed.
						const exp = state.rule.name;

						const states = completed.get(exp);
						// eslint-disable-next-line max-depth
						if (states) {
							states.push(state);
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
				if (wants.has(exp)) {
					wants.get(exp)!.push(state);

					for (const right of completed.get(exp) ?? []) {
						this.complete(state, right);
					}
				} else {
					wants.set(exp, [state]);
					this.predict(exp);
				}
			}
		}
	}

	predict(exp: string) {
		const rules = this.grammar.byName.get(exp) ?? [];

		for (const r of rules) {
			const wantedBy = this.wants.get(exp)!;
			const s = new State(r, 0, this.index, wantedBy);
			this.states.push(s);
		}
	}

	complete(left: State, right: State | StateChild) {
		const copy = left.nextState(right);
		this.states.push(copy);
	}
}
