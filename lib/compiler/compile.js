import process from 'node:process';
import {resolve, dirname} from 'node:path';
import {readFileSync} from 'node:fs';
import {Parser} from '../runtime/parser.js';
import {
	Rule,
	Config,
	Include,
	MacroDefinition,
	Production,
	RawSourceCode,
	Expression,
} from './ast.js';
import bootstrap from './nearley-language-bootstrapped.js';
import {Uniquer} from './uniquer.js';
import {optimize} from './optimize.js';
import {
	EbnfSymbol,
	LiteralSymbol,
	MacroCallSymbol,
	MacroParameterSymbol,
	SubExpressionSymbol,
	TokenSymbol,
} from './symbol.js';

/**
 * @param {import('./ast.js').Node[]} structure
 * @param {import('../bin/nearleyc.js').NearleyOptions} options
 */
export function compile(structure, options) {
	return new Compiler(structure, options);
}

export class Compiler {
	#uniqueNames = new Uniquer();
	structure;
	options;
	/** @type {Rule[]} */
	rules = [];
	/** @type {string[]} */
	body = []; // @directives list
	/** @type {Map<string, Config>} */
	config = new Map(); // @config value
	/** @type {Map<string, MacroDefinition>} */
	macros = new Map();
	start = '';
	version = 'unknown';
	/** @type {string[]} */
	alreadyCompiled = [];

	/**
	 * @param {import('./ast.js').Node[]} structure
	 * @param {import('../bin/nearleyc.js').NearleyOptions} options
	 */
	constructor(structure, options) {
		Object.seal(this);
		this.structure = structure;
		this.options = options;

		if (options.version) this.version = options.version;

		this.#compile();
	}

	#compile() {
		for (let i = 0; i < this.structure.length; i++) {
			const item = /** @type {import('./ast.js').Node} */ (this.structure[i]);
			if (item instanceof RawSourceCode) {
				if (!this.options.nojs) {
					this.body.push(item.source);
				}
			} else if (item instanceof Include) {
				const path = resolve(
					this.options.args[0] ? dirname(this.options.args[0]) : process.cwd(),
					item.path,
				);

				if (!this.alreadyCompiled.includes(path)) {
					this.alreadyCompiled.push(path);
					const f = readFileSync(path).toString();
					const parser = new Parser(bootstrap);
					parser.feed(f);
					this.structure.splice(
						i + 1,
						0,
						.../** @type {import('./ast.js').Node[]} */ (parser.results[0]),
					);
				}
			} else if (item instanceof MacroDefinition) {
				this.macros.set(item.name, item);
			} else if (item instanceof Config) {
				this.config.set(item.name, item);
			} else {
				this.#produceRules(item, new Map());
				if (!this.start) {
					this.start = item.name;
				}
			}
		}

		if (this.options.optimize) optimize(this);
		return this;
	}

	/**
	 * @param {Production} prod
	 * @param {Map<string, string>} env
	 */
	#produceRules(prod, env) {
		for (const expression of prod.expressions) {
			this.#produceRule(prod.name, expression, env);
		}
	}

	/**
	 * @param {string} name
	 * @param {Expression} expression
	 * @param {Map<string, string>} env
	 */
	#produceRule(name, expression, env) {
		const symbols = expression.symbols
			.map((i) => this.#buildToken(name, i, env))
			.filter(Boolean);

		this.rules.push(
			new Rule(
				name,
				symbols,
				this.options.nojs ? undefined : expression.postprocess,
			),
		);
	}

	/**
	 * @param {string} ruleName
	 * @param {import('./symbol.js').CompilerSymbol} token
	 * @param {Map<string, string>} env
	 * @returns {import('../runtime/symbol.js').RuntimeSymbol}
	 */
	#buildToken(ruleName, token, env) {
		if (typeof token === 'string') {
			return token;
		}

		if (token instanceof RegExp) {
			return token;
		}

		if (token instanceof LiteralSymbol) {
			if (token.value.length === 0) {
				return '';
			}

			if (token.value.length === 1 || this.config.has('lexer')) {
				return token;
			}

			return this.#buildStringToken(ruleName, token, env);
		}

		if (token instanceof TokenSymbol) {
			return token;
		}

		if (token instanceof SubExpressionSymbol) {
			return this.#buildSubExpressionToken(ruleName, token, env);
		}

		if (token instanceof EbnfSymbol) {
			return this.#buildEBNFToken(ruleName, token, env);
		}

		if (token instanceof MacroCallSymbol) {
			return this.#buildMacroCallToken(ruleName, token, env);
		}

		if (token instanceof MacroParameterSymbol) {
			if (env.has(token.name)) {
				return this.#buildToken(
					ruleName,
					/** @type {string} */ (env.get(token.name)),
					env,
				);
			}

			throw new Error(`Unbound variable: ${token.name}`);
		}

		throw new Error(`unrecognized token: ${JSON.stringify(token)}`);
	}

	/**
	 * @param {string} ruleName
	 * @param {LiteralSymbol} token
	 * @param {Map<string, string>} env
	 */
	#buildStringToken(ruleName, {value}, env) {
		const newname = this.#uniqueNames.get(`${ruleName}$s`);
		this.#produceRule(
			newname,
			new Expression(
				value.split('').map((v) => new LiteralSymbol(v)),
				'joiner',
			),
			env,
		);
		return newname;
	}

	/**
	 * @param {string} ruleName
	 * @param {SubExpressionSymbol} token
	 * @param {Map<string, string>} env
	 */
	#buildSubExpressionToken(ruleName, {expression}, env) {
		const name = this.#uniqueNames.get(`${ruleName}$u`);
		this.#produceRules(new Production(name, expression), env);
		return name;
	}

	/**
	 * @param {string} ruleName
	 * @param {EbnfSymbol} token
	 * @param {Map<string, string>} env
	 */
	#buildEBNFToken(ruleName, token, env) {
		switch (token.modifier) {
			case EbnfSymbol.plus: {
				return this.#buildEBNFPlus(ruleName, token, env);
			}

			case EbnfSymbol.star: {
				return this.#buildEBNFStar(ruleName, token, env);
			}

			case EbnfSymbol.opt: {
				return this.#buildEBNFOpt(ruleName, token, env);
			}

			default: {
				throw new Error(`Unknown EBNF modifier ${token.modifier}`);
			}
		}
	}

	/**
	 * @param {string} ruleName
	 * @param {EbnfSymbol} token
	 * @param {Map<string, string>} env
	 */
	#buildEBNFPlus(ruleName, {expression}, env) {
		const name = this.#uniqueNames.get(`${ruleName}$e`);
		this.#produceRules(
			new Production(name, [
				new Expression([expression]),
				new Expression([name, expression], 'arrpush'),
			]),
			env,
		);
		return name;
	}

	/**
	 * @param {string} ruleName
	 * @param {EbnfSymbol} token
	 * @param {Map<string, string>} env
	 */
	#buildEBNFStar(ruleName, {expression}, env) {
		const name = this.#uniqueNames.get(`${ruleName}$e`);
		this.#produceRules(
			new Production(name, [
				new Expression([]),
				new Expression([name, expression], 'arrpush'),
			]),
			env,
		);
		return name;
	}

	/**
	 * @param {string} ruleName
	 * @param {EbnfSymbol} token
	 * @param {Map<string, string>} env
	 */
	#buildEBNFOpt(ruleName, {expression}, env) {
		const name = this.#uniqueNames.get(`${ruleName}$e`);
		this.#produceRules(
			new Production(name, [
				new Expression([expression], 'id'),
				new Expression([], 'void'),
			]),
			env,
		);
		return name;
	}

	/**
	 * @param {string} ruleName
	 * @param {MacroCallSymbol} token
	 * @param {Map<string, string>} env
	 */
	#buildMacroCallToken(ruleName, token, env) {
		const name = this.#uniqueNames.get(`${ruleName}$m`);
		const macro = this.macros.get(token.name);
		if (!macro) {
			throw new Error(`Unkown macro: ${token.name} (at ${ruleName})`);
		}

		if (macro.parameters.length !== token.args.length) {
			throw new Error('Argument count mismatch.');
		}

		const newenv = new Map(env);
		for (let i = 0; i < macro.parameters.length; i++) {
			const argrulename = this.#uniqueNames.get(`${ruleName}$n`);
			newenv.set(/** @type {string} */ (macro.parameters[i]), argrulename);

			this.#produceRules(
				new Production(argrulename, [
					/** @type {Expression} */ (token.args[i]),
				]),
				env,
			);
		}

		this.#produceRules(new Production(name, macro.expression), newenv);
		return name;
	}
}
