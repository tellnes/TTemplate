/**
 * @class 
**/
TT.Template = function(file, source) {
	TT._templates[file] = this;
	this.file = file;
	
	if (source) {
		this.source = source;
		this.state = TT.Template.STATE_READY;
	} else {
		this.source = null;
		this.state = TT.Template.STATE_INIT;
	}

	this.loadingListeners = [];
	this.virtual = {};
	
	this.isVirtual = false;
	
	this.parse();
};
TT.Template.STATE_INIT = 0;
TT.Template.STATE_LOADING = 1;
TT.Template.STATE_READY = 2;
TT.Template.prototype.load = function(callback) {
	callback = callback || TT.noop;
	switch(this.state) {
	case TT.Template.STATE_READY:
		callback(this);
		break;
	case TT.Template.STATE_LOADING:
		this.loadingListeners.push(callback);
		break;
	case TT.Template.STATE_INIT:
		this.state = TT.Template.STATE_LOADING;
		this.load(callback);

		TT.getFile(TT.options.path+this.file, this.loadCallback.bind(this));
		break;
	}
	return this;
};
TT.Template.prototype.loadCallback = function(source) {
	this.source = source;
	this.state = TT.Template.STATE_READY;
	TT.callEach(this.loadingListeners, [this]);
	this.loadingListeners = null;
};
TT.Template.prototype.evaluate = function(name, data, callback) {
	var vt = this.virtual[name];
	if (vt) {
		vt.controlInstance.display = true;
		vt.controlInstance.displayInfo = null;
		return new TT.Reader(vt, data, callback);
	}
	
};

TT.Template.prototype.getSource = function() {
	return this.parsedSource;
};
TT.Template.prototype.getFile = function() {
	return this.file;
};




TT.Template.prototype.parse = (function() {
	var STATES = {
		DEFAULT: 1,
		OPEN: 2,
	//	TEMPLATE: 4,
		LITERAL: 5,
		JS: 6,
		COMMENT: 7
	};

	function parse() {
		var source = this.source,
			length = source.length, 
			obj, 
			c, 
			result = '', 
			resultIndex = 0,
			state = STATES.DEFAULT,
			index = 0,
			statements = [],
			statementIndex = -1,
			controlIndex = -1,
			controls = [],
			js = [],
			jsIndex = -1;

		for (; index < length; index++) {
			c = source[index];

			switch(state) {
			case STATES.DEFAULT:
				if (c === '{') {
					/*
					if (result[result.length-1] === "\n") { // hvis er starten på en ny linje, hopp over linjen
						result = result.substring(0, result.length-1);
						resultIndex--;
					}
					*/

					statementIndex++;
					obj = {statementIndex: statementIndex, resultIndex: resultIndex, name: '', params: null};
					state = STATES.OPEN;
				} else {
					result += c;
					resultIndex++;
				}
				break;
			case STATES.OPEN:
				if (c === '}') { // ender
					
					// Check Tag
					switch(true) {
					case obj.name[0] === '*': // comment
						statementIndex--;
						if ( (!obj.params && obj.name.charAt(obj.name.length-1)) || obj.params.charAt(obj.params.length-1) === '*') {
							return STATES.DEFAULT;
						} else {
							return STATES.COMMENT;
						}
				//		break;
					case (obj.name[0] === '/' || obj.name.substr(0, 3) === 'end'):
						if (!controls[controlIndex]) {
							throw new TT.Exception('Unexpected closetag '+obj.name.substr(1), this.file, TT.Exception.calcLine(source, index));
						}
						controls[controlIndex].closeIndex = statementIndex;
						obj.openIndex = controls[controlIndex].statementIndex;
						controlIndex--;
						break;

					case obj.name === 'elseif':
					case obj.name === 'else':
						if (!controls[controlIndex].elseIndexes) { controls[controlIndex].elseIndexes = []; }
						controls[controlIndex].elseIndexes.push(statementIndex);
						obj.ifIndex = controls[controlIndex].statementIndex;
						break;

					case obj.name === 'literal':
						statementIndex--;
						return STATES.LITERAL;

					case obj.name === 'js':
						statementIndex--;
						jsIndex++;
						js[jsIndex] = {sourceIndex: index, code : '', params: obj.params};
						return STATES.JS;

					case (obj.name in TT.controlStructures):
						controlIndex++;
						obj.controlIndex = controlIndex; 
						controls[controlIndex] = obj;
						break;

					case (obj.name in TT.functions): // is funciton
						break;

					case (obj.name[0] === '$'): // is variable
						break;

					default:
						throw new TT.Exception('Unexpected function '+obj.name, this.file, TT.Exception.calcLine(source, index));
				//		break;
					}

					statements[statementIndex] = obj;

					state = STATES.DEFAULT;
					
					// end check tag
					
				} else if (obj.params !== null) { // er parameter
					obj.params += c;
				} else if (c === ' ') { // skal starte p? parametre
					obj.params = '';
				} else { // navn
					obj.name += c;
				}
				break;
			case STATES.LITERAL:
				if (c === '{' && source.substr(index, 10) === '{/literal}') {
					state = STATES.DEFAULT;
					index += 9;
				} else {
					result += c;
					resultIndex++;
				}
				break;
			case STATES.JS:
				if (c === '{' && source.substr(index, 5) === '{/js}') {
					state = STATES.DEFAULT;
					index += 4;
				} else {
					js[jsIndex].code += c;
				}
				break;
			case STATES.COMMENT:
				if (c === '*' && source.substr(index, 2) === '*}') {
					state = STATES.DEFAULT;
					index += 1;
				}
				break;
			}
		}

	//	statementIndex++;
	//	statements[statementIndex] = {statementIndex: statementIndex, resultIndex: resultIndex, name: 'noop'};

		this.parsedSource = result;
		this.statements = statements;
		this.js = js;
		
		this.startStatement = 0;
		this.endStatement = statements.length;
		
	};

	return parse;
	
}());
