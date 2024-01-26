import process from 'node:process';
import {resolve, dirname} from 'node:path';
import {readFileSync} from 'node:fs';
import {Parser} from '../runtime/parser.js';
import type {NearleyOptions} from '../bin/nearleyc.js';
import {
	Rule,
	Config,
	Include,
	MacroDefinition,
	Production,
	RawSourceCode,
	Expression,
	type Node,
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
	type CompilerSymbol,
	type RuntimeSymbol,
} from './symbol.js';

export function compile(structure: Node[], options: NearleyOptions) {
	return new Compiler(structure, options);
}

export class Compiler {
	structure;
	options;
	rules: Rule[] = [];
	body: string[] = []; // @directives list
	config = new Map<string, Config>(); // @config value
	macros = new Map<string, MacroDefinition>();
	start = '';
	version = 'unknown';
	alreadyCompiled: string[] = [];
	#uniqueNames = new Uniquer();

	constructor(structure: Node[], options: NearleyOptions) {
		Object.seal(this);
		this.structure = structure;
		this.options = options;

		if (options.version) this.version = options.version;

		this.#compile();
	}

	#compile() {
		for (let i = 0; i < this.structure.length; i++) {
			const item = this.structure[i]!;

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
					this.structure.splice(i + 1, 0, ...(parser.results[0] as Node[]));
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

	#produceRules(prod: Production, env: Map<string, string>) {
		for (const expression of prod.expressions) {
			this.#produceRule(prod.name, expression, env);
		}
	}

	#produceRule(name: string, expression: Expression, env: Map<string, string>) {
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

	#buildToken(
		ruleName: string,
		token: CompilerSymbol,
		env: Map<string, string>,
	): RuntimeSymbol {
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
			return this.#buildEbnfToken(ruleName, token, env);
		}

		if (token instanceof MacroCallSymbol) {
			return this.#buildMacroCallToken(ruleName, token, env);
		}

		if (token instanceof MacroParameterSymbol) {
			const envValue = env.get(token.name);
			if (envValue !== undefined) {
				return this.#buildToken(ruleName, envValue, env);
			}

			throw new Error(`Unbound variable: ${token.name}`);
		}

		throw new Error(`unrecognized token: ${JSON.stringify(token)}`);
	}

	#buildStringToken(
		ruleName: string,
		{value}: LiteralSymbol,
		env: Map<string, string>,
	) {
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

	#buildSubExpressionToken(
		ruleName: string,
		{expression}: SubExpressionSymbol,
		env: Map<string, string>,
	) {
		const name = this.#uniqueNames.get(`${ruleName}$u`);
		this.#produceRules(new Production(name, expression), env);
		return name;
	}

	#buildEbnfToken(
		ruleName: string,
		token: EbnfSymbol,
		env: Map<string, string>,
	) {
		switch (token.modifier) {
			case EbnfSymbol.plus: {
				return this.#buildEbnfPlus(ruleName, token, env);
			}

			case EbnfSymbol.star: {
				return this.#buildEbnfStar(ruleName, token, env);
			}

			case EbnfSymbol.opt: {
				return this.#buildEbnfOpt(ruleName, token, env);
			}

			default: {
				throw new Error(`Unknown EBNF modifier ${token.modifier}`);
			}
		}
	}

	#buildEbnfPlus(
		ruleName: string,
		{expression}: EbnfSymbol,
		env: Map<string, string>,
	) {
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

	#buildEbnfStar(
		ruleName: string,
		{expression}: EbnfSymbol,
		env: Map<string, string>,
	) {
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

	#buildEbnfOpt(
		ruleName: string,
		{expression}: EbnfSymbol,
		env: Map<string, string>,
	) {
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

	#buildMacroCallToken(
		ruleName: string,
		token: MacroCallSymbol,
		env: Map<string, string>,
	) {
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
			newenv.set(macro.parameters[i]!, argrulename);
			this.#produceRules(new Production(argrulename, [token.args[i]!]), env);
		}

		this.#produceRules(new Production(name, macro.expression), newenv);
		return name;
	}
}
