(function(TT) {

var exceptionListeners = [];

/**
 * @class 
**/
TT.Exception = function(message, file, line) {
	this.name = 'JSTemplateException';
	this.message = message;
	
	if (file && line) {
		this.file = TT.options.path+file;
		this.line = line;
	}
	
	TT.callEach(exceptionListeners, [this]);
	
	throw new Error(this.toString());
};
TT.Exception.calcLine = function(source, index) {
	return source.slice(0, index).split("\n").length;
};

TT.Exception.prototype.toString = function() { 
	return this.name+': '+this.message + (this.file ? ' in file '+this.file + ' at line '+this.line : ''); 
};

TT.Exception.listen = function(handle) {
	exceptionListeners.push(handle);
};

}(TT));