/**
 * @class 
**/
TT.VirtualTemplate = function(name, template, info, controlInstance) {
	this.template = template;
	
	this.startStatement = info.statementIndex;
	this.endStatement = info.closeIndex+1;

	this.statementInfo = info;
	this.controlInstance = controlInstance;
	
	this.isVirtual = true;
};
TT.VirtualTemplate.prototype.getParser = function() {
	return this.template.getParser();
};
TT.VirtualTemplate.prototype.load = function(cb) {
	cb(this);
};
TT.VirtualTemplate.prototype.evaluate = function(name, data, callback) {
	var vt = this.template.virtual[name];
	if (vt) {
		vt.controlInstance.display = true;
		vt.controlInstance.displayInfo = null;
		return new TT.Reader(vt, data, callback);
	}
	
};
