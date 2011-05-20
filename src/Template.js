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
};
TT.Template.STATE_INIT = 0;
TT.Template.STATE_LOADING = 1;
TT.Template.STATE_READY = 2;
TT.Template.prototype.getParser = function() {
	if (!this._parser) { 
		this._parser = new TT.Parser(this);
		this.startStatement = 0;
		this.endStatement = this._parser.statements.length;
	}
	return this._parser;
};
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
