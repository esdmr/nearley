// Generated automatically by nearley, version 3.0.3
// https://github.com/esdmr/nearley (fork of https://github.com/Hardmath123/nearley)
import * as nearley from "../../runtime/index.js";
const __a = 0 as unknown as [any, any, any, any, any, any, any, any, ...any[]];
const __t = 0 as unknown as nearley.lexer.Token;

	import {EbnfSymbol, MacroParameterSymbol, MacroCallSymbol, SubExpressionSymbol} from '../symbol.js';
	import {Expression, Production, RawSourceCode, Include, Config, MacroDefinition} from '../ast.js';

	function insensitive({value}: nearley.LiteralSymbol) {
		const result = [];

		for (const c of value) {
			if (c.toUpperCase() !== c || c.toLowerCase() !== c) {
				result.push(new RegExp(`[${c.toLowerCase()}${c.toUpperCase()}]`, 'u'));
			} else {
				result.push(new nearley.LiteralSymbol(c));
			}
		}

		return new SubExpressionSymbol([new Expression(result, 'joiner')]);
	}

// final$1
(nearley.id)([__t] as const);
((_) => undefined)([] as const);
// final
(([, a]) => a)([([(nearley.id)([__a] as const)] as const), ([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const)] as const), ([(nearley.id)([__a] as const)] as const), (nearley.id)([__t] as const)] as const);
(([, a]) => a)([([(nearley.id)([__a] as const)] as const), ([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const)] as const), ([(nearley.id)([__a] as const)] as const), ((_) => undefined)([] as const)] as const);
// prog
([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const)] as const);
([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a, _b, c]) => new Expression(a, c))(__a)] as const)] as const)] as const);
([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), (d => [...d[0], d[4]])([__a, __a, __t, __a, (([a]) => new Expression(a))(__a)] as const)] as const)] as const);
([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), (d => [...d[0], d[4]])([__a, __a, __t, __a, (([a, _b, c]) => new Expression(a, c))(__a)] as const)] as const)] as const);
([(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)(__a)] as const), ([(([i]) => String(i))(__a)] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const)] as const);
([(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)(__a)] as const), ([(([i]) => String(i))(__a)] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a, _b, c]) => new Expression(a, c))(__a)] as const)] as const)] as const);
([(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)(__a)] as const), ([(([i]) => String(i))(__a)] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), (d => [...d[0], d[4]])([__a, __a, __t, __a, (([a]) => new Expression(a))(__a)] as const)] as const)] as const);
([(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)(__a)] as const), ([(([i]) => String(i))(__a)] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), (d => [...d[0], d[4]])([__a, __a, __t, __a, (([a, _b, c]) => new Expression(a, c))(__a)] as const)] as const)] as const);
([(([_a, _b, c]) => c)([__t, ([(nearley.id)(__a)] as const), (([a]) => new RawSourceCode(String(a)))([__t] as const)] as const)] as const);
([(d => new Config(d[1], d[3]))([__t, (([i]) => String(i))([__t] as const), ([__t] as const), (([i]) => String(i))([__t] as const)] as const)] as const);
([(d => new Config(d[1], d[3]))([__t, (([i]) => String(i))([__t] as const), ([__t] as const), (([i]) => String(i))([__t] as const)] as const)] as const);
([(d => new Config(d[1], d[3].value))([__t, (([i]) => String(i))([__t] as const), ([__t] as const), (([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const)] as const)] as const);
([(d => new Config(d[1], d[3].value))([__t, (([i]) => String(i))([__t] as const), ([__t] as const), (([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const)] as const)] as const);
([(d => new Config(d[1], d[3].source))([__t, (([i]) => String(i))([__t] as const), ([__t] as const), (([a]) => new RawSourceCode(String(a)))([__t] as const)] as const)] as const);
([(([_a, _b, {value}]) => new Include(value))([((d) => d.join(''))([__t, __t, __t, __t, __t, __t, __t, __t] as const), ([(nearley.id)(__a)] as const), (([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const)] as const)] as const);
([(([_a, _b, {value}]) => new Include(value))([((d) => d.join(''))([__t, __t, __t, __t, __t, __t, __t, __t] as const), ([(nearley.id)(__a)] as const), (([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, (d => [...d[0], d[4]])(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))(__a), __t, __a, __a, __a, __t, __a, __t, __a, __a] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))(__a), __t, __a, __a, __a, __t, __a, __t, __a, (d => [...d[0], d[4]])(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(([_a, _b, c]) => c)([__t, __a, (([a]) => new RawSourceCode(String(a)))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(d => new Config(d[1], d[3]))([__t, (([i]) => String(i))(__a), __a, (([i]) => String(i))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(d => new Config(d[1], d[3]))([__t, (([i]) => String(i))(__a), __a, (([i]) => String(i))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(d => new Config(d[1], d[3].value))([__t, (([i]) => String(i))(__a), __a, (([a]) => new nearley.LiteralSymbol(String(a)))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(d => new Config(d[1], d[3].value))([__t, (([i]) => String(i))(__a), __a, (([a]) => new nearley.LiteralSymbol(String(a)))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(d => new Config(d[1], d[3].source))([__t, (([i]) => String(i))(__a), __a, (([a]) => new RawSourceCode(String(a)))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(([_a, _b, {value}]) => new Include(value))([((d) => d.join(''))(__a), __a, (([a]) => new nearley.LiteralSymbol(String(a)))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), ([(([_a, _b, {value}]) => new Include(value))([((d) => d.join(''))(__a), __a, (([a]) => new nearley.LiteralSymbol(String(a)))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const), ([__t] as const), ([(d => new Production(d[0], d[4]))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const), ([__t] as const), ([(d => new MacroDefinition(d[0], d[3], d[9]))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const), ([__t] as const), ([(([_a, _b, c]) => c)(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const), ([__t] as const), ([(d => new Config(d[1], d[3]))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const), ([__t] as const), ([(d => new Config(d[1], d[3].value))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const), ([__t] as const), ([(d => new Config(d[1], d[3].source))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const), ([__t] as const), ([(([_a, _b, {value}]) => new Include(value))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))(__a), __a, __a] as const)] as const)] as const);
(([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const)] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))([(([i]) => String(i))(__a), __a, __t, __a, __a] as const), ([__t] as const), (([a, _b, c]) => [a, ...c])([(d => new Production(d[0], d[4]))(__a), __a, (([a, _b, c]) => [a, ...c])(__a)] as const)] as const)] as const);
// prod
(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([a]) => new Expression(a))([__a] as const)] as const)] as const);
(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])(__a)] as const)] as const)] as const);
(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([a, _b, c]) => new Expression(a, c))([__a, __a, (([a]) => new RawSourceCode(String(a)))(__a)] as const)] as const)] as const);
(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (d => [...d[0], d[4]])([([(([a]) => new Expression(a))(__a)] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), (([a]) => new Expression(a))([__a] as const)] as const)] as const);
(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (d => [...d[0], d[4]])([([(([a]) => new Expression(a))(__a)] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])(__a)] as const)] as const)] as const);
(d => new Production(d[0], d[4]))([(([i]) => String(i))([__t] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (d => [...d[0], d[4]])([([(([a]) => new Expression(a))(__a)] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), (([a, _b, c]) => new Expression(a, c))([__a, __a, (([a]) => new RawSourceCode(String(a)))(__a)] as const)] as const)] as const);
(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([i]) => String(i))([__t] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([a]) => new Expression(a))([__a] as const)] as const)] as const);
(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([i]) => String(i))([__t] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])(__a)] as const)] as const)] as const);
(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([i]) => String(i))([__t] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([a, _b, c]) => new Expression(a, c))([__a, __a, (([a]) => new RawSourceCode(String(a)))(__a)] as const)] as const)] as const);
(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([i]) => String(i))([__t] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (d => [...d[0], d[4]])([([(([a]) => new Expression(a))(__a)] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), (([a]) => new Expression(a))([__a] as const)] as const)] as const);
(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([i]) => String(i))([__t] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (d => [...d[0], d[4]])([([(([a]) => new Expression(a))(__a)] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])(__a)] as const)] as const)] as const);
(d => new MacroDefinition(d[0], d[3], d[9]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([i]) => String(i))([__t] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (d => [...d[0], d[4]])([([(([a]) => new Expression(a))(__a)] as const), ([(nearley.id)(__a)] as const), __t, ([(nearley.id)(__a)] as const), (([a, _b, c]) => new Expression(a, c))([__a, __a, (([a]) => new RawSourceCode(String(a)))(__a)] as const)] as const)] as const);
(([_a, _b, c]) => c)([__t, ([(nearley.id)([__a] as const)] as const), (([a]) => new RawSourceCode(String(a)))([__t] as const)] as const);
(d => new Config(d[1], d[3]))([__t, (([i]) => String(i))([__t] as const), ([__t] as const), (([i]) => String(i))([__t] as const)] as const);
(d => new Config(d[1], d[3]))([__t, (([i]) => String(i))([__t] as const), ([__t] as const), (([i]) => String(i))([__t] as const)] as const);
(d => new Config(d[1], d[3].value))([__t, (([i]) => String(i))([__t] as const), ([__t] as const), (([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const)] as const);
(d => new Config(d[1], d[3].value))([__t, (([i]) => String(i))([__t] as const), ([__t] as const), (([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const)] as const);
(d => new Config(d[1], d[3].source))([__t, (([i]) => String(i))([__t] as const), ([__t] as const), (([a]) => new RawSourceCode(String(a)))([__t] as const)] as const);
(([_a, _b, {value}]) => new Include(value))([((d) => d.join(''))([__t, __t, __t, __t, __t, __t, __t, __t] as const), ([(nearley.id)([__a] as const)] as const), (([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const)] as const);
(([_a, _b, {value}]) => new Include(value))([((d) => d.join(''))([__t, __t, __t, __t, __t, __t, __t, __t] as const), ([(nearley.id)([__a] as const)] as const), (([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const)] as const);
// prod$1
((d) => d.join(''))([__t, __t, __t, __t, __t, __t, __t, __t] as const);
// expression+
([(([a]) => new Expression(a))([([(([i]) => String(i))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([]) => '')(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([, a]) => new MacroParameterSymbol(a))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(d => new MacroCallSymbol(d[0], d[3]))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([a, b]) => b ? insensitive(a) : a)(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([, a]) => new nearley.TokenSymbol(a))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(nearley.id)(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([_a, _b, c]) => new SubExpressionSymbol(c))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([a, _b, c]) => new EbnfSymbol(a, c))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([i]) => String(i))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([]) => '')(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([, a]) => new MacroParameterSymbol(a))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (d => new MacroCallSymbol(d[0], d[3]))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([a, b]) => b ? insensitive(a) : a)(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([, a]) => new nearley.TokenSymbol(a))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (nearley.id)(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([_a, _b, c]) => new SubExpressionSymbol(c))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([a, _b, c]) => new EbnfSymbol(a, c))(__a)] as const)] as const)] as const);
([(([a, _b, c]) => new Expression(a, c))([([(([i]) => String(i))(__a)] as const), ([(nearley.id)(__a)] as const), (([a]) => new RawSourceCode(String(a)))([__t] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([i]) => String(i))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([]) => '')(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([, a]) => new MacroParameterSymbol(a))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(d => new MacroCallSymbol(d[0], d[3]))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([a, b]) => b ? insensitive(a) : a)(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([, a]) => new nearley.TokenSymbol(a))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(nearley.id)(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([_a, _b, c]) => new SubExpressionSymbol(c))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([a, _b, c]) => new EbnfSymbol(a, c))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([i]) => String(i))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([]) => '')(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([, a]) => new MacroParameterSymbol(a))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (d => new MacroCallSymbol(d[0], d[3]))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([a, b]) => b ? insensitive(a) : a)(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([, a]) => new nearley.TokenSymbol(a))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (nearley.id)(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([_a, _b, c]) => new SubExpressionSymbol(c))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([a, _b, c]) => new EbnfSymbol(a, c))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a, _b, c]) => new Expression(a, c))([([(([i]) => String(i))(__a)] as const), ([(nearley.id)(__a)] as const), (([a]) => new RawSourceCode(String(a)))([__t] as const)] as const)] as const);
// expressionlist
([(([a]) => new Expression(a))([([(([i]) => String(i))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([]) => '')(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([, a]) => new MacroParameterSymbol(a))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(d => new MacroCallSymbol(d[0], d[3]))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([a, b]) => b ? insensitive(a) : a)(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([, a]) => new nearley.TokenSymbol(a))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(nearley.id)(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([_a, _b, c]) => new SubExpressionSymbol(c))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([([(([a, _b, c]) => new EbnfSymbol(a, c))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([i]) => String(i))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([]) => '')(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([, a]) => new MacroParameterSymbol(a))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (d => new MacroCallSymbol(d[0], d[3]))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([a, b]) => b ? insensitive(a) : a)(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([, a]) => new nearley.TokenSymbol(a))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (nearley.id)(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([_a, _b, c]) => new SubExpressionSymbol(c))(__a)] as const)] as const)] as const);
([(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([a, _b, c]) => new EbnfSymbol(a, c))(__a)] as const)] as const)] as const);
([(([a, _b, c]) => new Expression(a, c))([([(([i]) => String(i))(__a)] as const), ([(nearley.id)(__a)] as const), (([a]) => new RawSourceCode(String(a)))([__t] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([i]) => String(i))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([]) => '')(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([, a]) => new MacroParameterSymbol(a))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(d => new MacroCallSymbol(d[0], d[3]))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([a, b]) => b ? insensitive(a) : a)(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([, a]) => new nearley.TokenSymbol(a))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(nearley.id)(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([_a, _b, c]) => new SubExpressionSymbol(c))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([([(([a, _b, c]) => new EbnfSymbol(a, c))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([i]) => String(i))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([]) => '')(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([, a]) => new MacroParameterSymbol(a))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (d => new MacroCallSymbol(d[0], d[3]))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([a, b]) => b ? insensitive(a) : a)(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([, a]) => new nearley.TokenSymbol(a))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (nearley.id)(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([_a, _b, c]) => new SubExpressionSymbol(c))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([__a, __a, (([a, _b, c]) => new EbnfSymbol(a, c))(__a)] as const)] as const)] as const);
(d => [...d[0], d[4]])([([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([a, _b, c]) => new Expression(a, c))([([(([i]) => String(i))(__a)] as const), ([(nearley.id)(__a)] as const), (([a]) => new RawSourceCode(String(a)))([__t] as const)] as const)] as const);
// wordlist
([(([i]) => String(i))([__t] as const)] as const);
([(([i]) => String(i))([__t] as const)] as const);
(d => [...d[0], d[4]])([([(([i]) => String(i))([__t] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([i]) => String(i))([__t] as const)] as const);
(d => [...d[0], d[4]])([([(([i]) => String(i))([__t] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t, ([(nearley.id)([__a] as const)] as const), (([i]) => String(i))([__t] as const)] as const);
// completeexpression
(([a]) => new Expression(a))([([(([i]) => String(i))([__t] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([]) => '')([__t] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([, a]) => new MacroParameterSymbol(a))([__t, (([i]) => String(i))(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([, a]) => new MacroParameterSymbol(a))([__t, (([i]) => String(i))(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([([(d => new MacroCallSymbol(d[0], d[3]))([(([i]) => String(i))(__a), __t, __a, __a, __a, __t] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([a, b]) => b ? insensitive(a) : a)([(([a]) => new nearley.LiteralSymbol(String(a)))(__a), (nearley.id)(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([a, b]) => b ? insensitive(a) : a)([(([a]) => new nearley.LiteralSymbol(String(a)))(__a), ((_) => undefined)(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([, a]) => new nearley.TokenSymbol(a))([__t, (([i]) => String(i))(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([, a]) => new nearley.TokenSymbol(a))([__t, (([i]) => String(i))(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([([(nearley.id)([(([a]) => new RegExp(String(a), 'u'))(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([_a, _b, c]) => new SubExpressionSymbol(c))([__t, __a, __a, __a, __t] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))(__a), __a, (([]) => EbnfSymbol.plus)(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))(__a), __a, (([]) => EbnfSymbol.star)(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([([(([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))(__a), __a, (([]) => EbnfSymbol.opt)(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([i]) => String(i))([__t] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([]) => '')([__t] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([, a]) => new MacroParameterSymbol(a))([__t, (([i]) => String(i))(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([, a]) => new MacroParameterSymbol(a))([__t, (([i]) => String(i))(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (d => new MacroCallSymbol(d[0], d[3]))([(([i]) => String(i))(__a), __t, __a, __a, __a, __t] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([a, b]) => b ? insensitive(a) : a)([(([a]) => new nearley.LiteralSymbol(String(a)))(__a), (nearley.id)(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([a, b]) => b ? insensitive(a) : a)([(([a]) => new nearley.LiteralSymbol(String(a)))(__a), ((_) => undefined)(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([, a]) => new nearley.TokenSymbol(a))([__t, (([i]) => String(i))(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([, a]) => new nearley.TokenSymbol(a))([__t, (([i]) => String(i))(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (nearley.id)([(([a]) => new RegExp(String(a), 'u'))(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([_a, _b, c]) => new SubExpressionSymbol(c))([__t, __a, __a, __a, __t] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))(__a), __a, (([]) => EbnfSymbol.plus)(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))(__a), __a, (([]) => EbnfSymbol.star)(__a)] as const)] as const)] as const);
(([a]) => new Expression(a))([(([a, _b, c]) => [...a, c])([([(([i]) => String(i))(__a)] as const), ([__t] as const), (([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))(__a), __a, (([]) => EbnfSymbol.opt)(__a)] as const)] as const)] as const);
(([a, _b, c]) => new Expression(a, c))([([(([i]) => String(i))([__t] as const)] as const), ([(nearley.id)([__a] as const)] as const), (([a]) => new RawSourceCode(String(a)))([__t] as const)] as const);
// expr_member
(([i]) => String(i))([__t] as const);
(([]) => '')([__t] as const);
(([, a]) => new MacroParameterSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const);
(([, a]) => new MacroParameterSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const);
(d => new MacroCallSymbol(d[0], d[3]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t] as const);
(d => new MacroCallSymbol(d[0], d[3]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t] as const);
(d => new MacroCallSymbol(d[0], d[3]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)([__a] as const)] as const), ([(([a]) => new Expression(a))([__a] as const)] as const), ([((_) => undefined)([] as const)] as const), __t] as const);
(([a, b]) => b ? insensitive(a) : a)([(([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const), (nearley.id)([__t] as const)] as const);
(([a, b]) => b ? insensitive(a) : a)([(([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const), ((_) => undefined)([] as const)] as const);
(([, a]) => new nearley.TokenSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const);
(([, a]) => new nearley.TokenSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const);
(nearley.id)([(([a]) => new RegExp(String(a), 'u'))([__t] as const)] as const);
(([_a, _b, c]) => new SubExpressionSymbol(c))([__t, ([(nearley.id)([__a] as const)] as const), ([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t] as const);
(([_a, _b, c]) => new SubExpressionSymbol(c))([__t, ([(nearley.id)([__a] as const)] as const), ([(([a]) => new Expression(a))([__a] as const)] as const), ([(nearley.id)([__a] as const)] as const), __t] as const);
(([_a, _b, c]) => new SubExpressionSymbol(c))([__t, ([(nearley.id)([__a] as const)] as const), ([(([a]) => new Expression(a))([__a] as const)] as const), ([((_) => undefined)([] as const)] as const), __t] as const);
(([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))([__t] as const), ([(nearley.id)([__a] as const)] as const), (([]) => EbnfSymbol.plus)([((d) => d.join(''))([__t, __t] as const)] as const)] as const);
(([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))([__t] as const), ([(nearley.id)([__a] as const)] as const), (([]) => EbnfSymbol.star)([((d) => d.join(''))([__t, __t] as const)] as const)] as const);
(([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))([__t] as const), ([(nearley.id)([__a] as const)] as const), (([]) => EbnfSymbol.opt)([((d) => d.join(''))([__t, __t] as const)] as const)] as const);
// expr_member$1
(nearley.id)([__t] as const);
((_) => undefined)([] as const);
// ebnf_modifier$1
((d) => d.join(''))([__t, __t] as const);
// ebnf_modifier
(([]) => EbnfSymbol.plus)([((d) => d.join(''))([__t, __t] as const)] as const);
(([]) => EbnfSymbol.star)([((d) => d.join(''))([__t, __t] as const)] as const);
(([]) => EbnfSymbol.opt)([((d) => d.join(''))([__t, __t] as const)] as const);
// ebnf_modifier$2
((d) => d.join(''))([__t, __t] as const);
// ebnf_modifier$3
((d) => d.join(''))([__t, __t] as const);
// expr
([(([i]) => String(i))([__t] as const)] as const);
([(([]) => '')([__t] as const)] as const);
([(([, a]) => new MacroParameterSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const)] as const);
([(([, a]) => new MacroParameterSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const)] as const);
([(d => new MacroCallSymbol(d[0], d[3]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const), ([(nearley.id)(__a)] as const), __t] as const)] as const);
([(d => new MacroCallSymbol(d[0], d[3]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const), ([((_) => undefined)(__a)] as const), __t] as const)] as const);
([(([a, b]) => b ? insensitive(a) : a)([(([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const), (nearley.id)([__t] as const)] as const)] as const);
([(([a, b]) => b ? insensitive(a) : a)([(([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const), ((_) => undefined)([] as const)] as const)] as const);
([(([, a]) => new nearley.TokenSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const)] as const);
([(([, a]) => new nearley.TokenSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const)] as const);
([(nearley.id)([(([a]) => new RegExp(String(a), 'u'))([__t] as const)] as const)] as const);
([(([_a, _b, c]) => new SubExpressionSymbol(c))([__t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const), ([(nearley.id)(__a)] as const), __t] as const)] as const);
([(([_a, _b, c]) => new SubExpressionSymbol(c))([__t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const), ([((_) => undefined)(__a)] as const), __t] as const)] as const);
([(([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), (([]) => EbnfSymbol.plus)([((d) => d.join(''))(__a)] as const)] as const)] as const);
([(([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), (([]) => EbnfSymbol.star)([((d) => d.join(''))(__a)] as const)] as const)] as const);
([(([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), (([]) => EbnfSymbol.opt)([((d) => d.join(''))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([i]) => String(i))([__t] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([]) => '')([__t] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([, a]) => new MacroParameterSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([, a]) => new MacroParameterSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (d => new MacroCallSymbol(d[0], d[3]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const), ([(nearley.id)(__a)] as const), __t] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (d => new MacroCallSymbol(d[0], d[3]))([(([i]) => String(i))([__t] as const), __t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const), ([((_) => undefined)(__a)] as const), __t] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([a, b]) => b ? insensitive(a) : a)([(([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const), (nearley.id)([__t] as const)] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([a, b]) => b ? insensitive(a) : a)([(([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const), ((_) => undefined)([] as const)] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([, a]) => new nearley.TokenSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([, a]) => new nearley.TokenSymbol(a))([__t, (([i]) => String(i))([__t] as const)] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (nearley.id)([(([a]) => new RegExp(String(a), 'u'))([__t] as const)] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([_a, _b, c]) => new SubExpressionSymbol(c))([__t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const), ([(nearley.id)(__a)] as const), __t] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([_a, _b, c]) => new SubExpressionSymbol(c))([__t, ([(nearley.id)(__a)] as const), ([(([a]) => new Expression(a))(__a)] as const), ([((_) => undefined)(__a)] as const), __t] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), (([]) => EbnfSymbol.plus)([((d) => d.join(''))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), (([]) => EbnfSymbol.star)([((d) => d.join(''))(__a)] as const)] as const)] as const);
(([a, _b, c]) => [...a, c])([([(([i]) => String(i))([__t] as const)] as const), ([__t] as const), (([a, _b, c]) => new EbnfSymbol(a, c))([(([i]) => String(i))([__t] as const), ([(nearley.id)(__a)] as const), (([]) => EbnfSymbol.opt)([((d) => d.join(''))(__a)] as const)] as const)] as const);
// word
(([i]) => String(i))([__t] as const);
(([i]) => String(i))([__t] as const);
// string
(([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const);
(([a]) => new nearley.LiteralSymbol(String(a)))([__t] as const);
// charclass
(([a]) => new RegExp(String(a), 'u'))([__t] as const);
// js
(([a]) => new RawSourceCode(String(a)))([__t] as const);
// _$1
(nearley.id)([([__t] as const)] as const);
(nearley.id)([([(nearley.id)([__t] as const), __t, ([(nearley.id)(__a)] as const)] as const)] as const);
(nearley.id)([([(nearley.id)([__t] as const), __t, ([((_) => undefined)(__a)] as const)] as const)] as const);
((_) => undefined)([] as const);
// _
([(nearley.id)([([__t] as const)] as const)] as const);
([(nearley.id)([([(nearley.id)(__a), __t, __a] as const)] as const)] as const);
([((_) => undefined)([] as const)] as const);
// ws
([__t] as const);
([(nearley.id)([__t] as const), __t, ([(nearley.id)([__a] as const)] as const)] as const);
([(nearley.id)([__t] as const), __t, ([(nearley.id)([__a] as const)] as const)] as const);
([(nearley.id)([__t] as const), __t, ([((_) => undefined)([] as const)] as const)] as const);
