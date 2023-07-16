import {Rule} from './rule.js';

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
			if (!Object.prototype.hasOwnProperty.call(byName, rule.name)) {
				byName[rule.name] = [];
			}

			byName[rule.name].push(rule);
		}
	}
}
