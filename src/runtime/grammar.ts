import type {Lexer} from 'moo';
import type {Rule} from './rule.js';

export class Grammar {
	lexer;
	rules;
	start;
	byName = new Map<string, Rule[]>();

	constructor(rules: Rule[], start?: string, lexer?: Lexer) {
		Object.seal(this);
		this.rules = rules;
		this.start = start ?? this.rules[0]?.name ?? '';
		this.lexer = lexer;
		const byName = this.byName;

		if (!this.start) throw new Error('Grammar has no start rule');

		for (const rule of this.rules) {
			const rules = byName.get(rule.name);
			if (rules) {
				rules.push(rule);
			} else {
				byName.set(rule.name, [rule]);
			}
		}
	}
}
