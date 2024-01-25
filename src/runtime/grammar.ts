export class Grammar {
	lexer;
	rules;
	start;
	/** @type {Map<string, import('./rule.js').Rule[]>} */
	byName = new Map();

	/**
	 * @param {import('./rule.js').Rule[]} rules
	 * @param {string} [start]
	 * @param {import('moo').Lexer} [lexer]
	 */
	constructor(rules, start, lexer) {
		Object.seal(this);
		this.rules = rules;
		this.start = start || this.rules[0]?.name || '';
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
