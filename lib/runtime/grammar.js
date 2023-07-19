import {Rule} from './rule.js';

/**
 * @typedef {{
 *     Lexer: import('moo').Lexer;
 *     ParserStart: string;
 *     ParserRules: Rule[];
 * }} CompiledGrammar
 */
export class Grammar {
	// So we can allow passing (rules, start) directly to Parser for backwards compatibility
	/**
	 * @param {CompiledGrammar} rules
	 * @param {string} [start]
	 */
	static fromCompiled(rules, start = rules.ParserStart) {
		const lexer = rules.Lexer;

		const rules_ = rules.ParserRules.map(
			({name, symbols, postprocess}) => new Rule(name, symbols, postprocess),
		);
		const g = new Grammar(rules_, start);
		g.lexer = lexer; // Nb. storing lexer on Grammar is iffy, but unavoidable
		return g;
	}

	/** @type {import('moo').Lexer | undefined} */
	lexer;
	rules;
	start;
	byName = new Map();

	/**
	 * @param {Rule[]} rules
	 * @param {string} start
	 */
	constructor(rules, start) {
		Object.seal(this);
		this.rules = rules;
		this.start = start || this.rules[0]?.name || '';
		const byName = this.byName;

		if (!this.start) throw new Error('Grammar has no start rule');

		for (const rule of this.rules) {
			if (!byName.has(rule.name)) {
				byName.set(rule.name, []);
			}

			byName.get(rule.name).push(rule);
		}
	}
}
