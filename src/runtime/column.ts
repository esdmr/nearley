import type {LexerState} from 'moo';
import type {Grammar} from './grammar.js';
import {State, type StateChild} from './state.js';
import {fail} from './fail.js';
import {NonterminalSymbol} from './symbol.js';

export class Column {
	lexerState: LexerState | undefined;
	readonly grammar;
	readonly index;
	readonly states: State[] = [];

	/** States indexed by the non-terminal they expect */
	readonly wants = new Map<string, State[]>();

	/** List of states that expect a token */
	readonly scannable: State[] = [];

	/** States that are nullable */
	readonly completed = new Map<string, State[]>();

	constructor(grammar: Grammar, index: number) {
		Object.seal(this);
		this.grammar = grammar;
		this.index = index;
	}

	process() {
		// Nb. we push() during iteration
		for (const state of this.states) {
			if (state.isComplete) {
				state.finish();
				if (state.data === fail) continue;

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
					const states = this.completed.get(exp);

					if (states) {
						states.push(state);
					} else {
						this.completed.set(exp, [state]);
					}
				}
			} else {
				// Queue scannable states
				const exp = state.rule.symbols[state.dot];
				if (!(exp instanceof NonterminalSymbol)) {
					this.scannable.push(state);
					continue;
				}

				// Predict
				if (this.wants.has(exp.name)) {
					this.wants.get(exp.name)!.push(state);

					for (const right of this.completed.get(exp.name) ?? []) {
						this.complete(state, right);
					}
				} else {
					this.wants.set(exp.name, [state]);
					this.predict(exp.name);
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
