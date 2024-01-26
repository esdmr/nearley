import type {Lexer, LexerState, Token} from 'moo';
import {Column} from './column.js';
import {LexerError, ParserError} from './error.js';
import {StreamLexer} from './lexer.js';
import {type State, StateChild} from './state.js';
import {LiteralSymbol, TokenSymbol, type RuntimeSymbol} from './symbol.js';
import type {Grammar} from './grammar.js';

export class Parser {
	// Create a reserved token for indicating a parse fail
	static fail = {};

	grammar;
	lexer: Lexer;
	lexerState: LexerState | undefined;
	table: Array<Column | undefined>;
	current = 0;
	results: readonly unknown[] = [];

	constructor(grammar: Grammar) {
		Object.seal(this);

		this.grammar = grammar;

		// Setup lexer
		this.lexer = grammar.lexer ?? new StreamLexer();

		// Setup a table
		const column = new Column(grammar, 0);
		const table = [column];
		this.table = table;

		// I could be expecting anything.
		column.wants.set(grammar.start, []);
		column.predict(grammar.start);
		// TODO what if start rule is nullable?
		column.process();
	}

	feed(chunk: string) {
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
				throw new LexerError(
					this.current,
					typeof error === 'object' && error && 'token' in error
						? error.token
						: undefined,
					this.reportLexerError(error),
				);
			}

			// We add new states to table[current+1]
			column = this.table[this.current]!;

			// GC unused states
			this.table[this.current - 1] = undefined;

			const n = this.current + 1;
			const nextColumn = new Column(this.grammar, n);
			this.table.push(nextColumn);

			// Advance all tokens that expect the symbol
			const literal = token.text ?? token.value;
			const value = lexer instanceof StreamLexer ? token.value : token;
			const scannable = column.scannable;
			for (let w = scannable.length; w--; ) {
				const state = scannable[w]!;
				const expect = state.rule.symbols[state.dot] as Exclude<
					RuntimeSymbol,
					string
				>;
				// Try to consume the token
				// either regex or literal
				if (
					expect instanceof RegExp
						? expect.test(String(value))
						: expect instanceof TokenSymbol
						? expect.token === token.type
						: expect.value === literal
				) {
					// Add it
					const next = state.nextState(
						new StateChild(value, token, true, n - 1),
					);
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
				throw new ParserError(this.current, token, this.reportError(token));
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

	reportLexerError(lexerError: unknown) {
		let tokenDisplay;
		let lexerMessage;
		// Planning to add a token property to moo's thrown error
		// even on erroring tokens to be used in error display below
		if (typeof lexerError === 'object' && lexerError && 'token' in lexerError) {
			const token = lexerError.token as Token;
			tokenDisplay = `input ${JSON.stringify(token.text[0])} (lexer error)`;
			lexerMessage = this.lexer.formatError(token, 'Syntax error');
		} else {
			tokenDisplay = 'input (lexer error)';
			lexerMessage = String(lexerError);
		}

		return this.reportErrorCommon(lexerMessage, tokenDisplay);
	}

	reportError(token: Token) {
		const tokenDisplay =
			(token.type ? `${token.type} token: ` : '') +
			JSON.stringify(token.value ?? token);
		const lexerMessage = this.lexer.formatError(token, 'Syntax error');
		return this.reportErrorCommon(lexerMessage, tokenDisplay);
	}

	reportErrorCommon(lexerMessage: string, tokenDisplay: string) {
		const lines = [lexerMessage];
		const lastColumnIndex = this.table.length - 2;
		const lastColumn = this.table[lastColumnIndex]!;
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
				(state) => this.buildFirstStateStack(state, []) ?? ([state] as const),
			);

			// Display each state that is expecting a terminal symbol next.
			for (const stateStack of stateStacks) {
				const state = stateStack[0];
				const nextSymbol = state.rule.symbols[state.dot]!;
				const symbolDisplay = this.getSymbolDisplay(nextSymbol);
				lines.push(`A ${symbolDisplay} based on:`);
				this.displayStateStack(stateStack, lines);
			}
		}

		lines.push('');
		return lines.join('\n');
	}

	displayStateStack(stateStack: readonly State[], lines: string[]) {
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

	getSymbolDisplay(symbol: RuntimeSymbol) {
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
	buildFirstStateStack(
		state: State,
		visited: readonly State[],
	): readonly [State, ...State[]] | undefined {
		if (visited.includes(state)) {
			// Found cycle, return undefined
			// to eliminate this path from the results, because
			// we don't know how to display it meaningfully
			return undefined;
		}

		if (state.wantedBy.length === 0) {
			return [state];
		}

		const previousState = state.wantedBy[0]!;
		const childVisited = [state, ...visited];
		const childResult = this.buildFirstStateStack(previousState, childVisited);
		if (childResult === undefined) {
			return undefined;
		}

		return [state, ...childResult];
	}

	save() {
		const column = this.table[this.current]!;
		column.lexerState = this.lexerState;
		return column;
	}

	restore(column: Column) {
		const index = column.index;
		this.current = index;
		this.table[index] = column;
		this.table.splice(index + 1);
		this.lexerState = column.lexerState;

		// Incrementally keep track of results
		this.results = this.finish();
	}

	finish() {
		// Return the possible parsings
		const considerations = [];
		const start = this.grammar.start;
		const column = this.table.at(-1);

		if (!column) {
			throw new RangeError('Parser table is empty');
		}

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

function getSymbolLongDisplay(symbol: RuntimeSymbol) {
	if (typeof symbol === 'string') {
		return symbol;
	}

	if (symbol instanceof LiteralSymbol) {
		return JSON.stringify(symbol.value);
	}

	if (symbol instanceof RegExp) {
		return `character matching ${symbol}`;
	}

	if (symbol instanceof TokenSymbol) {
		return `${symbol.token} token`;
	}

	throw new Error(
		`Unknown symbol type: ${typeof symbol} ${JSON.stringify(symbol)}`,
	);
}
