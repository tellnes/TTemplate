/**
 * @class 
**/
TT.Reader = function(template, data, callback) {
	this.template = template;
//	this.data = instance.data.clone(data);
	this.data = data;
	this.scopeIndex = this.data.addScope();
	
	this.parser = template.getParser();
	this.source = this.parser.result;
	this.statements = this.parser.statements;

	this.templateData = {
		Version: TT.Version,
		source: template.source,
		file: template.file
	};
	this.data.set('template', this.templateData);
	
	this._callbacks = [];
	
	this._listeners = {};
	
	this._callbackCounter = 0;
	this._callbackFinish = -1;
	
	
	this.result = '';
//	try {
		this.read();
		this.readJS();
//	} catch (e) { console.error(e.stack); }

	this.addEventListener('finish', callback);
	
	this._callbackFinish++;

	if (this._callbackCounter === this._callbackFinish) {
		this._finish();
	}
	
};

TT.Reader.prototype.throwException = function(msg) {
	throw new TT.Exception(msg, this.getFile(), this.getLine());
};
TT.Reader.prototype.getFile = function() {
	return this.template.file;
};
TT.Reader.prototype.getLine = function() {
	return TT.Exception.calcLine(this.source, this.sliceIndex);
};


TT.Reader.prototype.read = function() {
	var source = this.source, statements = this.statements, endStatement = this.template.endStatement, obj;

	this.index = this.template.startStatement; //console.log(this.template, this.index, this.statements)
	if (this.template.isVirtual) {
		this.sliceIndex = statements[this.index].resultIndex;
	} else {
		this.sliceIndex = 0;
	}
	while (this.index !== endStatement) {
		obj = statements[this.index];
//		index = obj.resultIndex-index;
		this.addContent( source.slice(this.sliceIndex, obj.resultIndex) );
		this.sliceIndex = obj.resultIndex;
		this.index++;

		if (obj.name[0] === '$') {
			this.addContent(String.interpret( this.parseVar( obj.name ) ));
		} else {
			this.parseFunction(obj);
		}
		
//		console.log(obj.statementIndex, this.index, obj.name, obj.params, endStatement, obj.resultIndex)
	}

	if (!this.template.isVirtual) {
		this.addContent(source.slice(this.sliceIndex));
	}
	
};
TT.Reader.prototype.addEventListener = function(name, handle) {
	if (!this._listeners[name]) { this._listeners[name] = []; }
	this._listeners[name].push(handle);
};
TT.Reader.prototype.runEventListener = function(name, args) {
	if (this._listeners[name]) {
		var i = 0, l = this._listeners[name].length;
		for(; i < l; i++) {
			try {
				this._listeners[name][i].apply(this, args);
			} catch(e) {
				if (name !== 'error') { this.runEventListener('error', [e]); }
			}
		}
	}
};
TT.Reader.prototype.jump = function(index) {
	this.index = index;
	this.sliceIndex = this.statements[index].resultIndex;
};
TT.Reader.prototype.addContent = function(content) {
	this.result += content;
};

TT.Reader.prototype.readJS = function() {
	var js = this.parser.js, length = js.length, i = 0, item, params;
	if (!length) { return; }
	
	for(; i < length;i++) {
		item = js[i];
		params = this.parseParams(item.params);
		if ('finish' in params) {
			this.addEventListener('finish', this.evalJS.bind(this, item));
		} else if ('defer' in params) {
			window.setTimeout(this.evalJS.bind(this, item), 1);
		} else {
			this.evalJS.call(this, item);
		}
	}
	
};
TT.Reader.prototype.evalJS = function(item) {
	try {
		eval(item.code);
	} catch(e) {
		throw new TT.Exception(e, this.template.file, TT.Exception.calcLine(this.template.source, item.sourceIndex) + (e.line || e.lineNumber || 1)-1 );
	}
};
TT.Reader.prototype.parseFunction = function(obj) {
//	console.log(obj.name, obj)
	
	if (obj.name[0] === '/') {
		if (!this.statements[obj.openIndex].instance.close(obj)) {
			this.statements[obj.openIndex].instance = null;
		}
	} else if (obj.name in TT.controlStructures) { // if is an control structure
		if (obj.instance) {
			obj.instance.reader = this;
		} else {
			obj.instance = new TT.controlStructures[obj.name](this, obj);
		}
		obj.instance.open(obj);
	} else if (obj.name in TT.functions) { // if is an normal function
		this.addContent(String.interpret( TT.functions[obj.name].call(this, obj.params, obj) ));
	}
	/*
	else {
		console.error(obj.name)
	}
	*/
};


TT.Reader.prototype.getVar = function(name) {
/*
	if (this.data.has(name)) { 
		return this.data.get(name); 
	}
*/
	
	var list = [], i, l, data;
	
	
	var state = 'default', listIndex = 0, c, v = '', j;
	for (i = 0, l = name.length; i < l; i++) {
		c = name[i];
		switch(state) {
		case 'default':
			switch(c) {
			case '[':
				state = 'brackets';
				break;
			case '.':
				listIndex++;
				break;
			default:
				if (!list[listIndex]) { list[listIndex] = ''; }
				list[listIndex] += c;
				break;
			}
			break;
		case 'brackets':
			if (c === ']') {
				listIndex++;
				list[listIndex] = this.parseVar(v);
				state = 'brackets-end';
				v = '';
			} else if (c === '"' || c === "'") {
				j = name.indexOf(c, i);
				v += name.substring(i, j);
				i = j;
			} else {
				v += c;
			}
			break;
		case 'brackets-end':
			if (c === '.') {
				listIndex++;
				state = 'default';
			} else if(c === '[') {
				state = 'brackets';
			}
			break;
		}
	}

	data = this.data.get(list[0]);

	for(l = list.length, i = 1; data && typeof data === 'object' && i<l;) {
		data = data[list[i]];
		i++;
		
		if (i !== l && typeof data !== 'object') { 
			return null; 
		}
	}
//	console.log(name, list, data)
	
//	if (!this.vars[name]) { this.vars[name] = vars; }

	return data;
};

TT.Reader.prototype.parseParams = function(params, required) {
	if (!params) { params = ''; }
	
	var list = params.split(TT.spaceSplitPattern), i = list.length, p;
	params = {}; 

	while(i--) {
		p = list[i].split('=');
		params[p[0]] = this.parseVar(p[1]);
	}

//	if (required) { this.checkRequired(params, required); }

	return params;
};
TT.Reader.prototype.checkRequired = function(params, required) {
	required = required.all(Object.prototype.hasOwnProperty.bind(params));

	if (!required) {
		this.throwException('Missing required params');
	}
	return required;
};




TT.Reader.prototype._finish = function() {
	var result = this.result, callbacks = this._callbacks, i = callbacks.length, item;
	
	while(i--) {
		item = callbacks[i];
		result = result.substr(0, item.index)+item.result+result.substr(item.index);
	}
	this.data.removeScope(this.scopeIndex);
	this.runEventListener('finish', [result]);
};
(function() {
	function callback(id, result) {
		this._callbackFinish++;
		this._callbacks[id].result = result;

		if (this._callbackCounter === this._callbackFinish) {
			this._finish();
		}
	}
	TT.Reader.prototype.getCallback = function() {
		var id = this._callbackCounter++;
		this._callbacks[id] = {index: this.result.length};
		return callback.bind(this, id);
	};
}());

TT.Reader.prototype.parseVar = function(v) {
	if (!v) { return undefined; }

	var funcs = v.split('|'), a, i, length, func, params;
	v = funcs[0];
	
	switch(v) {
	case 'true': v = true; break;
	case 'false': v = false; break;
	case 'null': v = null; break;
	default:
	
		switch(v.substr(0, 1)) {
		case '$':
			v = this.getVar(v.substr(1));
			break;
		case '"':
		case "'":
			v = v.slice(1, v.length-1);
			break;
		
		case '[':
			if (v.substr(v.length-1) === ']') {
				v = v.substring(1, v.length-1).split(',');
				for(i = v.length;i--;) {
					v[i] = this.parseVar(v[i]);
				}
			} else {
				v = null;
			}
			break;
		
		default:
			a = parseFloat(v);
			v = (isNaN(a) ? v : a);
			break;
		}
	
		for(i = 1, length = funcs.length; i < length; i++) {
			func = funcs[i];
			// a = args
			a = func.indexOf(':');
			if (a !== -1) {
				params = func.slice(a+1).split(':').map(this.parseVar, this);
				func = func.slice(0, a);
			} else {
				params = [];
			}
		
			// a = type
			a = typeof v;
			if (func in TT.modifiers[a]) {
				v = TT.modifiers[a][func].apply(v, params);
			} else if (func in TT.modifiers.all) {
				v = TT.modifiers.all[func].apply(v, params);
			} else if (typeof v[func] === "function") {
				v = v[func].apply(v, params);
			} else {
				this.throwException("Can't find the function: "+func);
			}
		}
		break;
	}
	
	return v;
};