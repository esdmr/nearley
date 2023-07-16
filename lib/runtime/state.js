import {Parser} from './parser.js';

// A State is a rule at a position from a given starting point in the input stream (reference)
export class State {
	left;
	right;

	constructor(rule, dot, reference, wantedBy) {
		this.rule = rule;
		this.dot = dot;
		this.reference = reference;
		this.data = [];
		this.wantedBy = wantedBy;
		this.isComplete = this.dot === rule.symbols.length;
	}

	toString() {
		return `{${this.rule.toString(this.dot)}}, from: ${this.reference || 0}`;
	}

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
		const children = [];
		// eslint-disable-next-line unicorn/no-this-assignment
		let node = this;

		do {
			children.push(node.right.data);
			node = node.left;
		} while (node.left);

		children.reverse();
		return children;
	}

	finish() {
		if (this.rule.postprocess) {
			this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
		}
	}
}
