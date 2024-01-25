import {Parser} from './parser.js';

// A State is a rule at a position from a given starting point in the input stream (reference)
export class State {
	/** @type {State} */
	left = this;
	/** @type {State | StateChild | undefined} */
	right;
	/** @type {unknown} */
	data = [];
	rule;
	dot;
	reference;
	/** @type {State[]} */
	wantedBy;
	isComplete;

	/**
	 * @param {import('./rule.js').Rule} rule
	 * @param {number} dot
	 * @param {number} reference
	 * @param {State[]} wantedBy
	 */
	constructor(rule, dot, reference, wantedBy) {
		Object.seal(this);
		this.rule = rule;
		this.dot = dot;
		this.reference = reference;
		this.wantedBy = wantedBy;
		this.isComplete = this.dot === rule.symbols.length;
	}

	toString() {
		return `{${this.rule.toString(this.dot)}}, from: ${
			this.reference || 0
		}`;
	}

	/** @param {State | StateChild} child */
	nextState(child) {
		const state = new State(
			this.rule,
			this.dot + 1,
			this.reference,
			this.wantedBy,
		);
		state.left = this;
		state.right = child;
		if (state.isComplete) {
			state.data = state.build();
			// Having right set here will prevent the right state and its children
			// form being garbage collected
			state.right = undefined;
		}

		return state;
	}

	build() {
		/** @type {unknown[]} */
		const children = [];
		/** @type {State} */
		// eslint-disable-next-line unicorn/no-this-assignment
		let node = this;

		do {
			children.push(node.right?.data);
			node = node.left;
		} while (node.left !== node);

		children.reverse();
		return children;
	}

	finish() {
		if (this.rule.postprocess && Array.isArray(this.data)) {
			this.data = this.rule.postprocess(
				this.data,
				this.reference,
				Parser.fail,
				this.rule.name,
			);
		}
	}
}

export class StateChild {
	data;
	token;
	isToken;
	reference;

	/**
	 * @param {unknown} data
	 * @param {unknown} token
	 * @param {boolean} isToken
	 * @param {number} reference
	 */
	constructor(data, token, isToken, reference) {
		Object.seal(this);
		this.data = data;
		this.token = token;
		this.isToken = isToken;
		this.reference = reference;
	}
}
