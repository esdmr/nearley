import type {Lexer} from 'moo';
import type {Rule} from './rule.js';

export class Grammar {
	readonly lexer;
	readonly rules;
	readonly start;
	readonly byName = new Map<string, Rule[]>();

	constructor(rules: readonly Rule[], start?: string, lexer?: Lexer) {
		Object.seal(this);
		this.rules = rules;
		this.start = start ?? this.rules[0]?.name ?? '';
		this.lexer = lexer;

		if (!this.start) throw new Error('Grammar has no start rule');

		for (const rule of this.rules) {
			const rules = this.byName.get(rule.name);

			if (rules) {
				rules.push(rule);
			} else {
				this.byName.set(rule.name, [rule]);
			}
		}
	}
}
