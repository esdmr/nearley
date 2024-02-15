import {Parser} from '../runtime/parser.js';
import {array, id, ignore, string} from '../runtime/postprocess.js';
import {
	LiteralSymbol,
	NonterminalSymbol,
	RegExpSymbol,
	TokenSymbol,
	type RuntimeSymbol,
} from '../runtime/symbol.js';
import {
	Config,
	Expression,
	Include,
	MacroDefinition,
	Production,
	RawSourceCode,
	Rule,
	type Node,
} from './ast.js';
import bootstrap from './grammar/index.js';
import {
	EbnfSymbol,
	MacroCallSymbol,
	MacroParameterSymbol,
	SubExpressionSymbol,
	type CompilerSymbol,
} from './symbol.js';
import {Uniquer} from './uniquer.js';

export type CompilerOptions = {
	readonly version: string;
	readonly quiet: boolean;
	readonly readFile: (path: URL) => string;
};

type Environment = Map<string, NonterminalSymbol>;

export class Compiler {
	readonly options;
	rules: Rule[] = [];

	/** `@`directives list */
	readonly body: string[] = [];

	/** `@config` value */
	readonly config = new Map<string, Config>();

	readonly macros = new Map<string, MacroDefinition>();
	start = '';
	readonly alreadyCompiled = new Set<string>();
	readonly #uniqueNames = new Uniquer();

	constructor(options: CompilerOptions) {
		Object.seal(this);
		this.options = options;
	}

	compile(structure: Node[], path: URL) {
		for (const node of structure) {
			if (node instanceof RawSourceCode) {
				this.body.push(node.source);
			} else if (node instanceof Include) {
				const newPath = new URL(node.path, path);

				if (this.alreadyCompiled.has(newPath.href)) continue;
				this.alreadyCompiled.add(newPath.href);

				const parser = new Parser(bootstrap);
				parser.feed(this.options.readFile(newPath));
				this.compile(parser.results[0] as Node[], newPath);
			} else if (node instanceof MacroDefinition) {
				this.macros.set(node.name, node);
			} else if (node instanceof Config) {
				this.config.set(node.name, node);
			} else {
				this.#produceRules(node, new Map());

				if (!this.start) {
					this.start = node.name;
				}
			}
		}
	}

	#produceRules(prod: Production, env: Environment) {
		for (const expression of prod.expressions) {
			this.#produceRule(prod.name, expression, env);
		}
	}

	#produceRule(name: string, expression: Expression, env: Environment) {
		const symbols = expression.symbols
			.map((i) => this.#buildToken(name, i, env))
			.filter((i): i is RuntimeSymbol => i !== undefined);

		this.rules.push(new Rule(name, symbols, expression.postprocess));
	}

	#buildToken(
		ruleName: string,
		token: CompilerSymbol,
		env: Environment,
	): RuntimeSymbol | undefined {
		if (
			token instanceof NonterminalSymbol ||
			token instanceof RegExpSymbol ||
			token instanceof TokenSymbol
		) {
			return token;
		}

		if (token instanceof LiteralSymbol) {
			if (token.value.length === 0) {
				return;
			}

			if (token.value.length === 1 || this.config.has('lexer')) {
				return token;
			}

			return this.#buildStringToken(ruleName, token, env);
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

			throw new Error(`Unbound variable: ${JSON.stringify(token.name)}`);
		}

		throw new Error(
			`unrecognized token: ${typeof token} ${JSON.stringify(token)}`,
		);
	}

	#buildStringToken(
		ruleName: string,
		{value}: LiteralSymbol,
		env: Environment,
	) {
		const symbol = new NonterminalSymbol(
			this.#uniqueNames.get(`${ruleName}$s`),
		);
		this.#produceRule(
			symbol.name,
			new Expression(
				value.split('').map((v) => new LiteralSymbol(v)),
				string,
			),
			env,
		);
		return symbol;
	}

	#buildSubExpressionToken(
		ruleName: string,
		{expression}: SubExpressionSymbol,
		env: Environment,
	) {
		const symbol = new NonterminalSymbol(
			this.#uniqueNames.get(`${ruleName}$u`),
		);
		this.#produceRules(new Production(symbol.name, expression), env);
		return symbol;
	}

	#buildEbnfToken(ruleName: string, token: EbnfSymbol, env: Environment) {
		switch (token.modifier) {
			case '+': {
				return this.#buildEbnfPlus(ruleName, token, env);
			}

			case '*': {
				return this.#buildEbnfStar(ruleName, token, env);
			}

			case '?': {
				return this.#buildEbnfOpt(ruleName, token, env);
			}

			default: {
				throw new Error(
					`Unknown EBNF modifier ${JSON.stringify(token.modifier)}`,
				);
			}
		}
	}

	#buildEbnfPlus(ruleName: string, {expression}: EbnfSymbol, env: Environment) {
		const symbol = new NonterminalSymbol(
			this.#uniqueNames.get(`${ruleName}$e`),
		);
		this.#produceRules(
			new Production(symbol.name, [
				new Expression([expression]),
				new Expression([symbol, expression], array),
			]),
			env,
		);
		return symbol;
	}

	#buildEbnfStar(ruleName: string, {expression}: EbnfSymbol, env: Environment) {
		const symbol = new NonterminalSymbol(
			this.#uniqueNames.get(`${ruleName}$e`),
		);
		this.#produceRules(
			new Production(symbol.name, [
				new Expression([]),
				new Expression([symbol, expression], array),
			]),
			env,
		);
		return symbol;
	}

	#buildEbnfOpt(ruleName: string, {expression}: EbnfSymbol, env: Environment) {
		const symbol = new NonterminalSymbol(
			this.#uniqueNames.get(`${ruleName}$e`),
		);
		this.#produceRules(
			new Production(symbol.name, [
				new Expression([expression], id),
				new Expression([], ignore),
			]),
			env,
		);
		return symbol;
	}

	#buildMacroCallToken(
		ruleName: string,
		token: MacroCallSymbol,
		env: Environment,
	) {
		const symbol = new NonterminalSymbol(
			this.#uniqueNames.get(`${ruleName}$m`),
		);
		const macro = this.macros.get(token.name);

		if (!macro) {
			throw new Error(
				`Unknown macro: ${JSON.stringify(token.name)} (at ${JSON.stringify(
					ruleName,
				)})`,
			);
		}

		if (macro.parameters.length !== token.args.length) {
			throw new Error(
				`Argument count mismatch. Expected ${macro.parameters.length}, got ${
					token.args.length
				} (at ${JSON.stringify(ruleName)})`,
			);
		}

		const newEnv = new Map(env);

		for (let i = 0; i < macro.parameters.length; i++) {
			const argSymbol = new NonterminalSymbol(
				this.#uniqueNames.get(`${ruleName}$n`),
			);
			this.#produceRules(new Production(argSymbol.name, [token.args[i]!]), env);
			newEnv.set(macro.parameters[i]!, argSymbol);
		}

		this.#produceRules(new Production(symbol.name, macro.expression), newEnv);
		return symbol;
	}
}
