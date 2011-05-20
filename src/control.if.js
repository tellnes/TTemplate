/**
 * @class 
**/
TT.controlStructures['if'] = function(reader, info) {
	this.reader = reader;
	this.info = info;
	this.elseLength = (info.elseIndexes ? info.elseIndexes.length : 0);
};
TT.controlStructures['if'].prototype.open = function(info) {
	this.elseIndex = 0;
	this.isTrue = this.check( info.params );
	if (!this.isTrue) {
		this.jumpToNext();
	}
};
TT.controlStructures['if'].prototype.close = function() {
	return true;
};
TT.controlStructures['if'].prototype.jumpToNext = function() {
	this.reader.jump(this.elseLength > this.elseIndex ? this.info.elseIndexes[this.elseIndex++] : this.info.closeIndex);
};


TT.controlStructures.elseif = function(reader, info) {
	this.reader = reader;
	this.ifInstance = reader.statements[info.ifIndex].instance;
};
TT.controlStructures.elseif.prototype.open = function(info) {
	if(this.ifInstance.isTrue) {
		this.reader.jump(this.ifInstance.info.closeIndex);
	} else if (this.ifInstance.check(info.params)) {
		this.ifInstance.isTrue = true;
	} else {
		this.ifInstance.jumpToNext();
	}
};

TT.controlStructures['else'] = function(reader, info) {
	this.reader = reader;
	this.ifInstance = reader.statements[info.ifIndex].instance;
};
TT.controlStructures['else'].prototype.open = function(info) {
	if (this.ifInstance.isTrue) {
		this.reader.jump(this.ifInstance.info.closeIndex);
	}
};




TT.controlStructures['if'].operators = {
	'==': '==',
	'eq': '==',
	'!=': '!=',
	'ne': '!=',
	'neq': '!=',
	'>': '>',
	'gt': '>',
	'<': '<',
	'lt': '<',
	'>=': '>=',
	'gte': '>=',
	'ge': '>=',
	'<=': '<=',
	'lte': '<=',
	'le': '<=',
	'===': '===',
	'%': '%',
	'mod': '%',
	'||': '||',
	'OR': '||',
	'&&': '&&',
	'AND': '&&',
	'^': '^',
	'XOR': '^'
};
TT.controlStructures['if'].prototype.check = function(params) {
	var operators = TT.controlStructures['if'].operators;

	params = params.split(TT.spaceSplitPattern).map(function(item) {
		if (!item) { return ''; }
		
		if (item in operators) {
			return operators[item];
		} else {
			item = this.reader.parseVar(item);
			if (typeof item === 'object') { 
				item = String(item); 
			} else if (typeof item === "undefined") { 
				item = 'undefined'; 
			} else if (Object.isString(item)) {
				item = '"'+item.split('"').join('\\"').split("\n").join("\\n")+'"';
			}
		}
		return item;
	}, this).join(' ');
	
	
	//console.log(typeof params, params)
	params = '!!('+params+')';
	//console.log(params)
	//console.log(eval(params), params)
	var r = eval(params);
	
//	console.log(' - '+params+' - '+this.info.params)
	return r;
};