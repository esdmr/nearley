const {hasOwnProperty} = Object.prototype;

export class Rule {
	constructor(name, symbols, postprocess) {
		this.id = ++Rule.highestId;
		this.name = name;
		this.symbols = symbols; // A list of literal | regex class | nonterminal
		this.postprocess = postprocess;
	}

	toString(withCursorAt) {
		const symbolSequence =
			withCursorAt === undefined
				? this.symbols.map((s) => getSymbolShortDisplay(s)).join(' ')
				: `${this.symbols
						.slice(0, withCursorAt)
						.map((s) => getSymbolShortDisplay(s))
						.join(' ')} ● ${this.symbols
						.slice(withCursorAt)
						.map((s) => getSymbolShortDisplay(s))
						.join(' ')}`;
		return `${this.name} → ${symbolSequence}`;
	}
}

Rule.highestId = 0;

// A State is a rule at a position from a given starting point in the input stream (reference)
class State {
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

class Column {
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

					if (hasOwnProperty.call(completed, exp)) {
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

export class Grammar {
	// So we can allow passing (rules, start) directly to Parser for backwards compatibility
	static fromCompiled(rules, start) {
		const lexer = rules.Lexer;
		if (rules.ParserStart) {
			start = rules.ParserStart;
			rules = rules.ParserRules;
		}

		rules = rules.map(
			({name, symbols, postprocess}) => new Rule(name, symbols, postprocess),
		);
		const g = new Grammar(rules, start);
		g.lexer = lexer; // Nb. storing lexer on Grammar is iffy, but unavoidable
		return g;
	}

	lexer;

	constructor(rules, start) {
		this.rules = rules;
		this.start = start || this.rules[0].name;
		const byName = {};
		this.byName = byName;

		for (const rule of this.rules) {
			if (!hasOwnProperty.call(byName, rule.name)) {
				byName[rule.name] = [];
			}

			byName[rule.name].push(rule);
		}
	}
}

class StreamLexer {
	buffer;
	index;
	line;
	lastLineBreak;

	constructor() {
		this.reset('');
	}

	reset(data, state) {
		this.buffer = data;
		this.index = 0;
		this.line = state ? state.line : 1;
		this.lastLineBreak = state ? -state.col : 0;
	}

	next() {
		if (this.index < this.buffer.length) {
			const ch = this.buffer[this.index++];
			if (ch === '\n') {
				this.line += 1;
				this.lastLineBreak = this.index;
			}

			return {value: ch};
		}
	}

	save() {
		return {
			line: this.line,
			col: this.index - this.lastLineBreak,
		};
	}

	formatError(token, message) {
		// Nb. this gets called after consuming the offending token,
		// so the culprit is index-1
		const buffer = this.buffer;
		if (typeof buffer === 'string') {
			const lines = buffer
				.split('\n')
				.slice(Math.max(0, this.line - 5), this.line);

			let nextLineBreak = buffer.indexOf('\n', this.index);
			if (nextLineBreak === -1) {
				nextLineBreak = buffer.length;
			}

			const col = this.index - this.lastLineBreak;
			const lastLineDigits = String(this.line).length;
			message += ` at line ${this.line} col ${col}:\n\n`;
			message += lines
				.map(
					(line, i) =>
						`${pad(this.line - lines.length + i + 1, lastLineDigits)} ${line}`,
				)
				.join('\n');
			message += `\n${pad('', lastLineDigits + col)}^\n`;
			return message;
		}

		return `${message} at index ${this.index - 1}`;

		function pad(n, length) {
			const s = String(n);
			return Array.from({length: length - s.length + 1}).join(' ') + s;
		}
	}
}

export class ParserError extends Error {
	name = 'ParserError';
	offset;
	token;
}

export class Parser {
	constructor(rules, start, options) {
		let grammar;

		if (rules instanceof Grammar) {
			grammar = rules;
			options = start;
		} else {
			grammar = Grammar.fromCompiled(rules, start);
		}

		this.grammar = grammar;

		// Read options
		this.options = {
			keepHistory: false,
			lexer: grammar.lexer || new StreamLexer(),
		};

		for (const [key, value] of Object.entries(options || {})) {
			this.options[key] = value;
		}

		// Setup lexer
		this.lexer = this.options.lexer;
		this.lexerState = undefined;

		// Setup a table
		const column = new Column(grammar, 0);
		const table = [column];
		this.table = table;

		// I could be expecting anything.
		column.wants[grammar.start] = [];
		column.predict(grammar.start);
		// TODO what if start rule is nullable?
		column.process();
		this.current = 0; // Token index
	}

	feed(chunk) {
		const lexer = this.lexer;
		lexer.reset(chunk, this.lexerState);

		let token;
		let column;

		// eslint-disable-next-line no-constant-condition
		while (true) {
			try {
				token = lexer.next();
				if (!token) {
					break;
				}
			} catch (error) {
				// Create the next column so that the error reporter
				// can display the correctly predicted states.
				const nextColumn = new Column(this.grammar, this.current + 1);
				this.table.push(nextColumn);
				const error_ = new ParserError(this.reportLexerError(error));
				error_.offset = this.current;
				error_.token = error.token;
				throw error_;
			}

			// We add new states to table[current+1]
			column = this.table[this.current];

			// GC unused states
			if (!this.options.keepHistory) {
				delete this.table[this.current - 1];
			}

			const n = this.current + 1;
			const nextColumn = new Column(this.grammar, n);
			this.table.push(nextColumn);

			// Advance all tokens that expect the symbol
			const literal = token.text === undefined ? token.value : token.text;
			const value = lexer.constructor === StreamLexer ? token.value : token;
			const scannable = column.scannable;
			for (let w = scannable.length; w--; ) {
				const state = scannable[w];
				const expect = state.rule.symbols[state.dot];
				// Try to consume the token
				// either regex or literal
				if (
					expect.test
						? expect.test(value)
						: expect.type
						? expect.type === token.type
						: expect.literal === literal
				) {
					// Add it
					const next = state.nextState({
						data: value,
						token,
						isToken: true,
						reference: n - 1,
					});
					nextColumn.states.push(next);
				}
			}

			// Next, for each of the rules, we either
			// (a) complete it, and try to see if the reference row expected that
			//     rule
			// (b) predict the next nonterminal it expects by adding that
			//     nonterminal's start state
			// To prevent duplication, we also keep track of rules we have already
			// added

			nextColumn.process();

			// If needed, throw an error:
			if (nextColumn.states.length === 0) {
				// No states at all! This is not good.
				const error = new ParserError(this.reportError(token));
				error.offset = this.current;
				error.token = token;
				throw error;
			}

			// Maybe save lexer state
			if (this.options.keepHistory) {
				column.lexerState = lexer.save();
			}

			this.current++;
		}

		if (column) {
			this.lexerState = lexer.save();
		}

		// Incrementally keep track of results
		this.results = this.finish();

		// Allow chaining, for whatever it's worth
		return this;
	}

	reportLexerError(lexerError) {
		let tokenDisplay;
		let lexerMessage;
		// Planning to add a token property to moo's thrown error
		// even on erroring tokens to be used in error display below
		const token = lexerError.token;
		if (token) {
			tokenDisplay = `input ${JSON.stringify(token.text[0])} (lexer error)`;
			lexerMessage = this.lexer.formatError(token, 'Syntax error');
		} else {
			tokenDisplay = 'input (lexer error)';
			lexerMessage = lexerError.message;
		}

		return this.reportErrorCommon(lexerMessage, tokenDisplay);
	}

	reportError(token) {
		const tokenDisplay =
			(token.type ? `${token.type} token: ` : '') +
			JSON.stringify(token.value === undefined ? token : token.value);
		const lexerMessage = this.lexer.formatError(token, 'Syntax error');
		return this.reportErrorCommon(lexerMessage, tokenDisplay);
	}

	reportErrorCommon(lexerMessage, tokenDisplay) {
		const lines = [];
		lines.push(lexerMessage);
		const lastColumnIndex = this.table.length - 2;
		const lastColumn = this.table[lastColumnIndex];
		const expectantStates = lastColumn.states.filter(({rule, dot}) => {
			const nextSymbol = rule.symbols[dot];
			return nextSymbol && typeof nextSymbol !== 'string';
		});

		if (expectantStates.length === 0) {
			lines.push(
				`Unexpected ${tokenDisplay}. I did not expect any more input. Here is the state of my parse table:\n`,
			);
			this.displayStateStack(lastColumn.states, lines);
		} else {
			lines.push(
				`Unexpected ${tokenDisplay}. Instead, I was expecting to see one of the following:\n`,
			);
			// Display a "state stack" for each expectant state
			// - which shows you how this state came to be, step by step.
			// If there is more than one derivation, we only display the first one.
			const stateStacks = expectantStates.map(
				(state) => this.buildFirstStateStack(state, []) || [state],
			);
			// Display each state that is expecting a terminal symbol next.
			for (const stateStack of stateStacks) {
				const state = stateStack[0];
				const nextSymbol = state.rule.symbols[state.dot];
				const symbolDisplay = this.getSymbolDisplay(nextSymbol);
				lines.push(`A ${symbolDisplay} based on:`);
				this.displayStateStack(stateStack, lines);
			}
		}

		lines.push('');
		return lines.join('\n');
	}

	displayStateStack(stateStack, lines) {
		let lastDisplay;
		let sameDisplayCount = 0;

		for (const state of stateStack) {
			const display = state.rule.toString(state.dot);
			if (display === lastDisplay) {
				sameDisplayCount++;
			} else {
				if (sameDisplayCount > 0) {
					lines.push(`    ^ ${sameDisplayCount} more lines identical to this`);
				}

				sameDisplayCount = 0;
				lines.push(`    ${display}`);
			}

			lastDisplay = display;
		}
	}

	getSymbolDisplay(symbol) {
		return getSymbolLongDisplay(symbol);
	}

	/**
	 * Builds a the first state stack. You can think of a state stack as the call stack
	 * of the recursive-descent parser which the Nearley parse algorithm simulates.
	 * A state stack is represented as an array of state objects. Within a
	 * state stack, the first item of the array will be the starting
	 * state, with each successive item in the array going further back into history.
	 *
	 * This function needs to be given a starting state and an empty array representing
	 * the visited states, and it returns an single state stack.
	 */
	buildFirstStateStack(state, visited) {
		if (visited.includes(state)) {
			// Found cycle, return null
			// to eliminate this path from the results, because
			// we don't know how to display it meaningfully
			return null;
		}

		if (state.wantedBy.length === 0) {
			return [state];
		}

		const previousState = state.wantedBy[0];
		const childVisited = [state].concat(visited);
		const childResult = this.buildFirstStateStack(previousState, childVisited);
		if (childResult === null) {
			return null;
		}

		return [state].concat(childResult);
	}

	save() {
		const column = this.table[this.current];
		column.lexerState = this.lexerState;
		return column;
	}

	restore(column) {
		const index = column.index;
		this.current = index;
		this.table[index] = column;
		this.table.splice(index + 1);
		this.lexerState = column.lexerState;

		// Incrementally keep track of results
		this.results = this.finish();
	}

	// Nb. deprecated: use save/restore instead!
	rewind(index) {
		if (!this.options.keepHistory) {
			throw new Error('set option `keepHistory` to enable rewinding');
		}

		// Nb. recall column (table) indices fall between token indices.
		//        col 0   --   token 0   --   col 1
		this.restore(this.table[index]);
	}

	finish() {
		// Return the possible parsings
		const considerations = [];
		const start = this.grammar.start;
		const column = this.table[this.table.length - 1];
		for (const t of column.states) {
			if (
				t.rule.name === start &&
				t.dot === t.rule.symbols.length &&
				t.reference === 0 &&
				t.data !== Parser.fail
			) {
				considerations.push(t);
			}
		}

		return considerations.map(({data}) => data);
	}
}

// Create a reserved token for indicating a parse fail
Parser.fail = {};

function getSymbolLongDisplay(symbol) {
	const type = typeof symbol;
	if (type === 'string') {
		return symbol;
	}

	if (type === 'object') {
		if (symbol.literal) {
			return JSON.stringify(symbol.literal);
		}

		if (symbol instanceof RegExp) {
			return `character matching ${symbol}`;
		}

		if (symbol.type) {
			return `${symbol.type} token`;
		}

		if (symbol.test) {
			return `token matching ${String(symbol.test)}`;
		}

		throw new Error(`Unknown symbol type: ${symbol}`);
	}
}

function getSymbolShortDisplay(symbol) {
	const type = typeof symbol;
	if (type === 'string') {
		return symbol;
	}

	if (type === 'object') {
		if (symbol.literal) {
			return JSON.stringify(symbol.literal);
		}

		if (symbol instanceof RegExp) {
			return symbol.toString();
		}

		if (symbol.type) {
			return `%${symbol.type}`;
		}

		if (symbol.test) {
			return `<${String(symbol.test)}>`;
		}

		throw new Error(`Unknown symbol type: ${symbol}`);
	}
}
