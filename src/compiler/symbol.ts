import {string} from '../runtime/postprocess.js';
import {
	type RuntimeSymbol,
	LiteralSymbol,
	RegExpSymbol,
} from '../runtime/symbol.js';
import {Expression} from './ast.js';

export type CompilerSymbol =
	| RuntimeSymbol
	| MacroParameterSymbol
	| MacroCallSymbol
	| EbnfSymbol
	| SubExpressionSymbol;

export class MacroParameterSymbol {
	readonly name;

	constructor(name: string) {
		Object.seal(this);
		this.name = name;
	}

	toString() {
		return `$${this.name}`;
	}
}

export class MacroCallSymbol {
	readonly name;
	readonly args;

	constructor(name: string, args: readonly Expression[]) {
		Object.seal(this);
		this.name = name;
		this.args = args;
	}

	toString() {
		return `${this.name}[${this.args.join(', ')}]`;
	}
}

export type EbnfModifier = '*' | '+' | '?';

export class EbnfSymbol {
	readonly expression;
	readonly modifier;

	constructor(expression: CompilerSymbol, modifier: EbnfModifier) {
		Object.seal(this);
		this.expression = expression;
		this.modifier = modifier;
	}

	toString(): string {
		return `${this.expression.toString()}:${this.modifier}`;
	}
}

export class SubExpressionSymbol {
	readonly expression;

	constructor(expression: readonly Expression[]) {
		Object.seal(this);
		this.expression = expression;
	}

	toString() {
		return `(${this.expression.join(' | ').trim()})`;
	}
}

export function insensitive({value}: LiteralSymbol) {
	const result = [];

	for (const c of value) {
		if (c.toUpperCase() !== c || c.toLowerCase() !== c) {
			result.push(
				new RegExpSymbol(
					new RegExp(`[${c.toLowerCase()}${c.toUpperCase()}]`, 'u'),
				),
			);
		} else {
			result.push(new LiteralSymbol(c));
		}
	}

	return new SubExpressionSymbol([new Expression(result, string)]);
}
