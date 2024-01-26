@{%
	import {lexer} from './lexer.js';
%}

@lexer lexer
@include "rules.ne"
@preprocessor ts
