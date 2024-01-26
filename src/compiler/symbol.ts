import type {Expression} from './ast.js';
import type {RuntimeSymbol} from './symbol.js';

export type CompilerSymbol =
	| RuntimeSymbol
	| MacroParameterSymbol
	| MacroCallSymbol
	| EbnfSymbol
	| SubExpressionSymbol;

export * from '../runtime/symbol.js';

export class MacroParameterSymbol {
	name;

	constructor(name: string) {
		Object.seal(this);
		this.name = name;
	}
}

export class MacroCallSymbol {
	name;
	args;

	constructor(name: string, args: Expression[]) {
		Object.seal(this);
		this.name = name;
		this.args = args;
	}
}

export class EbnfSymbol {
	static star = '*';
	static plus = '+';
	static opt = '?';

	expression;
	modifier;

	constructor(expression: CompilerSymbol, modifier: string) {
		Object.seal(this);
		this.expression = expression;
		this.modifier = modifier;
	}
}

export class SubExpressionSymbol {
	expression;

	constructor(expression: Expression[]) {
		Object.seal(this);
		this.expression = expression;
	}
}
