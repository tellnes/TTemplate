/**
 * @class 
**/
TT.Parser = function(template) {
	this.template = template;
	this._parse();
};

TT.Parser.STATES = {
	DEFAULT: 1,
	OPEN: 2,
//	TEMPLATE: 4,
	LITERAL: 5,
	JS: 6,
	COMMENT: 7
};

TT.Parser.prototype._parse = function() {
	var STATES = TT.Parser.STATES, 
		source = this.template.source,
		length = source.length, 
		obj, 
		c, 
		result = '', 
		resultIndex = 0,
		state = STATES.DEFAULT;
		
	this.index = 0;
	this.statements = [];
	this.statementIndex = -1;
	this.controlIndex = -1;
	this.controls = [];
	this.js = [];
	this.jsIndex = -1;
	
	for (; this.index < length; this.index++) {
		c = source[this.index];
		
		switch(state) {
		case STATES.DEFAULT:
			if (c === '{') {
				/*
				if (result[result.length-1] === "\n") { // hvis er starten på en ny linje, hopp over linjen
					result = result.substring(0, result.length-1);
					resultIndex--;
				}
				*/

				this.statementIndex++;
				obj = {statementIndex: this.statementIndex, resultIndex: resultIndex, name: '', params: null};
				state = STATES.OPEN;
			} else {
				result += c;
				resultIndex++;
			}
			break;
		case STATES.OPEN:
			if (c === '}') { // ender
				state = this.checkTag(obj);
			} else if (obj.params !== null) { // er parameter
				obj.params += c;
			} else if (c === ' ') { // skal starte p? parametre
				obj.params = '';
			} else { // navn
				obj.name += c;
			}
			break;
		case STATES.LITERAL:
			if (c === '{' && source.substr(this.index, 10) === '{/literal}') {
				state = STATES.DEFAULT;
				this.index += 9;
			} else {
				result += c;
				resultIndex++;
			}
			break;
		case STATES.JS:
			if (c === '{' && source.substr(this.index, 5) === '{/js}') {
				state = STATES.DEFAULT;
				this.index += 4;
			} else {
				this.js[this.jsIndex].code += c;
			}
			break;
		case STATES.COMMENT:
			if (c === '*' && source.substr(this.index, 2) === '*}') {
				state = STATES.DEFAULT;
				this.index += 1;
			}
			break;
		}
	}
	
//	this.statementIndex++;
//	this.statements[this.statementIndex] = {statementIndex: this.statementIndex, resultIndex: resultIndex, name: 'noop'};
	
	this.result = result;
};
TT.Parser.prototype.checkTag = function(obj) {
	
	switch(true) {
	case obj.name[0] === '*': // comment
		this.statementIndex--;
		if ( (!obj.params && obj.name.charAt(obj.name.length-1)) || obj.params.charAt(obj.params.length-1) === '*') {
			return TT.Parser.STATES.DEFAULT;
		} else {
			return TT.Parser.STATES.COMMENT;
		}
//		break;
	case (obj.name[0] === '/' || obj.name.substr(0, 3) === 'end'):
		if (!this.controls[this.controlIndex]) {
			throw new TT.Exception('Unexpected closetag '+obj.name.substr(1), this.template.file, TT.Exception.calcLine(this.template.source, this.index));
		}
		this.controls[this.controlIndex].closeIndex = this.statementIndex;
		obj.openIndex = this.controls[this.controlIndex].statementIndex;
		this.controlIndex--;
		break;

	case obj.name === 'elseif':
	case obj.name === 'else':
		if (!this.controls[this.controlIndex].elseIndexes) { this.controls[this.controlIndex].elseIndexes = []; }
		this.controls[this.controlIndex].elseIndexes.push(this.statementIndex);
		obj.ifIndex = this.controls[this.controlIndex].statementIndex;
		break;
		
	case obj.name === 'literal':
		this.statementIndex--;
		return TT.Parser.STATES.LITERAL;
	
	case obj.name === 'js':
		this.statementIndex--;
		this.jsIndex++;
		this.js[this.jsIndex] = {sourceIndex: this.index, code : '', params: obj.params};
		return TT.Parser.STATES.JS;
		
	case (obj.name in TT.controlStructures):
		this.controlIndex++;
		obj.controlIndex = this.controlIndex; 
		this.controls[this.controlIndex] = obj;
		break;
		
	case (obj.name in TT.functions): // is funciton
		break;
		
	case (obj.name[0] === '$'): // is variable
		break;
		
	default:
		throw new TT.Exception('Unexpected function '+obj.name, this.template.file, TT.Exception.calcLine(this.template.source, this.index));
//		break;
	}
	
	this.statements[this.statementIndex] = obj;
	
	return TT.Parser.STATES.DEFAULT;
};
