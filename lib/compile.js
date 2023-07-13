import process from 'node:process';
import {resolve, dirname} from 'node:path';
import {readFileSync} from 'node:fs';
import {Grammar, Parser, Rule} from './nearley.js';
import bootstrap from './nearley-language-bootstrapped.js';

export function compile(structure, options) {
	const unique = uniquer();
	if (!options.alreadycompiled) {
		options.alreadycompiled = [];
	}

	const result = {
		rules: [],
		body: [], // @directives list
		customTokens: [], // %tokens
		config: {}, // @config value
		macros: {},
		start: '',
		version: options.version || 'unknown',
	};

	for (let i = 0; i < structure.length; i++) {
		const productionRule = structure[i];
		if (productionRule.body) {
			// This isn't a rule, it's an @directive.
			if (!options.nojs) {
				result.body.push(productionRule.body);
			}
		} else if (productionRule.include) {
			// Include file
			const path = resolve(
				options.args[0] ? dirname(options.args[0]) : process.cwd(),
				productionRule.include,
			);

			if (!options.alreadycompiled.includes(path)) {
				options.alreadycompiled.push(path);
				const f = readFileSync(path).toString();
				const parserGrammar = Grammar.fromCompiled(bootstrap);
				const parser = new Parser(parserGrammar);
				parser.feed(f);
				structure.splice(i + 1, 0, ...parser.results[0]);
			}
		} else if (productionRule.macro) {
			result.macros[productionRule.macro] = {
				args: productionRule.args,
				exprs: productionRule.exprs,
			};
		} else if (productionRule.config) {
			// This isn't a rule, it's an @config.
			result.config[productionRule.config] = productionRule.value;
		} else {
			produceRules(productionRule.name, productionRule.rules, {});
			if (!result.start) {
				result.start = productionRule.name;
			}
		}
	}

	return result;

	function produceRules(name, rules, env) {
		for (const i of rules) {
			const rule = buildRule(name, i, env);
			if (options.nojs) {
				rule.postprocess = null;
			}

			result.rules.push(rule);
		}
	}

	function buildRule(ruleName, rule, env) {
		const tokens = [];
		for (let i = 0; i < rule.tokens.length; i++) {
			const token = buildToken(ruleName, rule.tokens[i], env);
			if (token !== null) {
				tokens.push(token);
			}
		}

		return new Rule(ruleName, tokens, rule.postprocess);
	}

	function buildToken(ruleName, token, env) {
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

			if (token.literal.length === 1 || result.config.lexer) {
				return token;
			}

			return buildStringToken(ruleName, token, env);
		}

		if (token.token) {
			if (result.config.lexer) {
				const name = token.token;
				const expr = `{type: ${JSON.stringify(name)}}`;
				return {token: `(${expr})`};
			}

			return token;
		}

		if (token.subexpression) {
			return buildSubExpressionToken(ruleName, token, env);
		}

		if (token.ebnf) {
			return buildEBNFToken(ruleName, token, env);
		}

		if (token.macrocall) {
			return buildMacroCallToken(ruleName, token, env);
		}

		if (token.mixin) {
			if (env[token.mixin]) {
				return buildToken(ruleName, env[token.mixin], env);
			}

			throw new Error(`Unbound variable: ${token.mixin}`);
		}

		throw new Error(`unrecognized token: ${JSON.stringify(token)}`);
	}

	function buildStringToken(ruleName, {literal}, env) {
		const newname = unique(`${ruleName}$s`);
		produceRules(
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

	function buildSubExpressionToken(ruleName, {subexpression}, env) {
		const data = subexpression;
		const name = unique(`${ruleName}$u`);
		// Structure.push({"name": name, "rules": data});
		produceRules(name, data, env);
		return name;
	}

	function buildEBNFToken(ruleName, token, env) {
		switch (token.modifier) {
			case ':+': {
				return buildEBNFPlus(ruleName, token, env);
			}

			case ':*': {
				return buildEBNFStar(ruleName, token, env);
			}

			case ':?': {
				return buildEBNFOpt(ruleName, token, env);
			}

			default: {
				throw new Error(`Unknown EBNF modifier ${token.modifier}`);
			}
		}
	}

	function buildEBNFPlus(ruleName, {ebnf}, env) {
		const name = unique(`${ruleName}$e`);
		produceRules(
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

	function buildEBNFStar(ruleName, {ebnf}, env) {
		const name = unique(`${ruleName}$e`);
		produceRules(
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

	function buildEBNFOpt(ruleName, {ebnf}, env) {
		const name = unique(`${ruleName}$e`);
		produceRules(
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

	function buildMacroCallToken(ruleName, {macrocall, args}, env) {
		const name = unique(`${ruleName}$m`);
		const macro = result.macros[macrocall];
		if (!macro) {
			throw new Error(`Unkown macro: ${macrocall} (at ${ruleName})`);
		}

		if (macro.args.length !== args.length) {
			throw new Error('Argument count mismatch.');
		}

		const newenv = {__proto__: env};
		for (let i = 0; i < macro.args.length; i++) {
			const argrulename = unique(`${ruleName}$n`);
			newenv[macro.args[i]] = argrulename;
			produceRules(argrulename, [args[i]], env);
			// Structure.push({"name": argrulename, "rules":[token.args[i]]});
			// buildRule(name, token.args[i], env);
		}

		produceRules(name, macro.exprs, newenv);
		return name;
	}
}

function uniquer() {
	const uns = {};
	return unique;
	function unique(name) {
		const un = (uns[name] || 0) + 1;
		uns[name] = un;
		return `${name}$${un}`;
	}
}
