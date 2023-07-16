import process from 'node:process';
import {resolve, dirname} from 'node:path';
import {readFileSync} from 'node:fs';
import {Parser} from '../runtime/parser.js';
import {Grammar} from '../runtime/grammar.js';
import {Rule} from '../runtime/rule.js';
import bootstrap from './nearley-language-bootstrapped.js';
import {Uniquer} from './uniquer.js';
import {optimize} from './optimize.js';

export function compile(structure, options) {
	return new Compiler(structure, options).compile();
}

class Compiler {
	uniqueNames = new Uniquer();
	result = {
		rules: [],
		body: [], // @directives list
		customTokens: [], // %tokens
		config: {}, // @config value
		macros: {},
		start: '',
		version: 'unknown',
	};

	constructor(structure, options) {
		this.structure = structure;
		this.options = options;

		if (!options.alreadycompiled) {
			options.alreadycompiled = [];
		}

		if (options.version) this.result.version = options.version;
	}

	compile() {
		for (let i = 0; i < this.structure.length; i++) {
			const productionRule = this.structure[i];
			if (productionRule.body) {
				// This isn't a rule, it's an @directive.
				if (!this.options.nojs) {
					this.result.body.push(productionRule.body);
				}
			} else if (productionRule.include) {
				// Include file
				const path = resolve(
					this.options.args[0] ? dirname(this.options.args[0]) : process.cwd(),
					productionRule.include,
				);

				if (!this.options.alreadycompiled.includes(path)) {
					this.options.alreadycompiled.push(path);
					const f = readFileSync(path).toString();
					const parserGrammar = Grammar.fromCompiled(bootstrap);
					const parser = new Parser(parserGrammar);
					parser.feed(f);
					this.structure.splice(i + 1, 0, ...parser.results[0]);
				}
			} else if (productionRule.macro) {
				this.result.macros[productionRule.macro] = {
					args: productionRule.args,
					exprs: productionRule.exprs,
				};
			} else if (productionRule.config) {
				// This isn't a rule, it's an @config.
				this.result.config[productionRule.config] = productionRule.value;
			} else {
				this.produceRules(productionRule.name, productionRule.rules, {});
				if (!this.result.start) {
					this.result.start = productionRule.name;
				}
			}
		}

		if (this.options.optimize) optimize(this.result);
		return this.result;
	}

	produceRules(name, rules, env) {
		for (const i of rules) {
			const rule = this.buildRule(name, i, env);
			if (this.options.nojs) {
				rule.postprocess = null;
			}

			this.result.rules.push(rule);
		}
	}

	buildRule(ruleName, rule, env) {
		const tokens = [];
		for (let i = 0; i < rule.tokens.length; i++) {
			const token = this.buildToken(ruleName, rule.tokens[i], env);
			if (token !== null) {
				tokens.push(token);
			}
		}

		return new Rule(ruleName, tokens, rule.postprocess);
	}

	buildToken(ruleName, token, env) {
		if (typeof token === 'string') {
			if (token === 'null') {
				return null;
			}

			return token;
		}

		if (token instanceof RegExp) {
			return token;
		}

		if (token.literal) {
			if (token.literal.length === 0) {
				return null;
			}

			if (token.literal.length === 1 || this.result.config.lexer) {
				return token;
			}

			return this.buildStringToken(ruleName, token, env);
		}

		if (token.token) {
			if (this.result.config.lexer) {
				const name = token.token;
				const expr = `{type: ${JSON.stringify(name)}}`;
				return {token: `(${expr})`};
			}

			return token;
		}

		if (token.subexpression) {
			return this.buildSubExpressionToken(ruleName, token, env);
		}

		if (token.ebnf) {
			return this.buildEBNFToken(ruleName, token, env);
		}

		if (token.macrocall) {
			return this.buildMacroCallToken(ruleName, token, env);
		}

		if (token.mixin) {
			if (env[token.mixin]) {
				return this.buildToken(ruleName, env[token.mixin], env);
			}

			throw new Error(`Unbound variable: ${token.mixin}`);
		}

		throw new Error(`unrecognized token: ${JSON.stringify(token)}`);
	}

	buildStringToken(ruleName, {literal}, env) {
		const newname = this.uniqueNames.get(`${ruleName}$s`);
		this.produceRules(
			newname,
			[
				{
					tokens: literal.split('').map((d) => ({
						literal: d,
					})),
					postprocess: {builtin: 'joiner'},
				},
			],
			env,
		);
		return newname;
	}

	buildSubExpressionToken(ruleName, {subexpression}, env) {
		const data = subexpression;
		const name = this.uniqueNames.get(`${ruleName}$u`);
		// Structure.push({"name": name, "rules": data});
		this.produceRules(name, data, env);
		return name;
	}

	buildEBNFToken(ruleName, token, env) {
		switch (token.modifier) {
			case ':+': {
				return this.buildEBNFPlus(ruleName, token, env);
			}

			case ':*': {
				return this.buildEBNFStar(ruleName, token, env);
			}

			case ':?': {
				return this.buildEBNFOpt(ruleName, token, env);
			}

			default: {
				throw new Error(`Unknown EBNF modifier ${token.modifier}`);
			}
		}
	}

	buildEBNFPlus(ruleName, {ebnf}, env) {
		const name = this.uniqueNames.get(`${ruleName}$e`);
		this.produceRules(
			name,
			[
				{
					tokens: [ebnf],
				},
				{
					tokens: [name, ebnf],
					postprocess: {builtin: 'arrpush'},
				},
			],
			env,
		);
		return name;
	}

	buildEBNFStar(ruleName, {ebnf}, env) {
		const name = this.uniqueNames.get(`${ruleName}$e`);
		this.produceRules(
			name,
			[
				{
					tokens: [],
				},
				{
					tokens: [name, ebnf],
					postprocess: {builtin: 'arrpush'},
				},
			],
			env,
		);
		return name;
	}

	buildEBNFOpt(ruleName, {ebnf}, env) {
		const name = this.uniqueNames.get(`${ruleName}$e`);
		this.produceRules(
			name,
			[
				{
					tokens: [ebnf],
					postprocess: {builtin: 'id'},
				},
				{
					tokens: [],
					postprocess: {builtin: 'nuller'},
				},
			],
			env,
		);
		return name;
	}

	buildMacroCallToken(ruleName, {macrocall, args}, env) {
		const name = this.uniqueNames.get(`${ruleName}$m`);
		const macro = this.result.macros[macrocall];
		if (!macro) {
			throw new Error(`Unkown macro: ${macrocall} (at ${ruleName})`);
		}

		if (macro.args.length !== args.length) {
			throw new Error('Argument count mismatch.');
		}

		const newenv = {__proto__: env};
		for (let i = 0; i < macro.args.length; i++) {
			const argrulename = this.uniqueNames.get(`${ruleName}$n`);
			newenv[macro.args[i]] = argrulename;
			this.produceRules(argrulename, [args[i]], env);
			// Structure.push({"name": argrulename, "rules":[token.args[i]]});
			// buildRule(name, token.args[i], env);
		}

		this.produceRules(name, macro.exprs, newenv);
		return name;
	}
}
