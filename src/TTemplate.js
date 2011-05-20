/**
 * @class 
**/
var TT = function (options) {
	this.data = new TT.Data();
	this.templates = {};
};

/**
 *  Version
**/
TT.Version = '@VERSION';

TT.spaceSplitPattern = / (?=(?:[^"]*"[^"]*")*(?![^"]*"))/;

TT.options = {
	path: ''
};



TT.defaultData = {};

TT._templates = { };

TT.controlStructures = { };

/**
 *  @name Load Template
 *  @param name
 *  @param callback
**/
TT.loadTemplate = function (name, callback) {
	if (!TT._templates[name]) { 
		TT._templates[name] = new TT.Template(name);
	}
	TT._templates[name].load(callback);
};

/**
 *  Assign a variable
 *  @param key
 *  @param val
**/
TT.prototype.assign = function (key, val) {
	this.data.set(key, val);
};
TT.prototype.assign_object = function (obj) {
	var key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			this.data.set(key, obj[key]);
		}
	}
};

TT.prototype.fetch = function (name, callback) {
	var data = this.data;
	TT.loadTemplate(name, function (template) { 
		new TT.Reader(template, data, callback);
	});
};
TT.prototype.evaluate = function (template, name, callback, vars) {
	var data = this.data.clone(vars);
	TT.loadTemplate(template, function (template) {
		template.evaluate(name, data, callback);
	});
};


TT.callEach = function (list, args) {
	var i = 0, l = list.length;
	for (; i < l; i++) {
		list[i].apply(null, args);
	}
};