import {fail} from './fail.js';
import type {Rule} from './rule.js';

/**
 * A State is a rule at a position from a given starting point in the input
 * stream (reference)
 */
export class State {
	left: State = this;
	right: State | StateChild | undefined;
	data: unknown = [];
	readonly rule;
	readonly dot;
	readonly reference;
	readonly wantedBy: readonly State[];
	readonly isComplete;
	#isPostProcessed = false;

	constructor(
		rule: Rule,
		dot: number,
		reference: number,
		wantedBy: readonly State[],
	) {
		Object.seal(this);
		this.rule = rule;
		this.dot = dot;
		this.reference = reference;
		this.wantedBy = wantedBy;
		this.isComplete = this.dot === rule.symbols.length;
	}

	toString() {
		return `{${this.rule.toString(this.dot)}}, from: ${this.reference}`;
	}

	nextState(child: State | StateChild) {
		const state = new State(
			this.rule,
			this.dot + 1,
			this.reference,
			this.wantedBy,
		);
		state.left = this;
		state.right = child;
		if (state.isComplete) {
			state.data = state.#build();
			// Having right set here will prevent the right state and its children
			// form being garbage collected
			state.right = undefined;
		}

		return state;
	}

	finish() {
		if (this.rule.postprocess && !this.#isPostProcessed) {
			this.data = this.rule.postprocess(
				this.data,
				this.reference,
				fail,
				this.rule.name,
			);
			this.#isPostProcessed = true;
		}
	}

	#build() {
		const children: unknown[] = [];
		// eslint-disable-next-line unicorn/no-this-assignment, @typescript-eslint/no-this-alias
		let node: State = this;

		do {
			children.push(node.right?.data);
			node = node.left;
		} while (node.left !== node);

		children.reverse();
		return children;
	}
}

export class StateChild {
	readonly data;
	readonly token;
	readonly reference;

	constructor(data: unknown, token: unknown, reference: number) {
		Object.seal(this);
		this.data = data;
		this.token = token;
		this.reference = reference;
	}
}
