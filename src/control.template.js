/**
 * @class 
**/
TT.controlStructures.template = function(reader, info) {
	this.reader = reader;
	this.display = false;
	
	var params = this.reader.parseParams(info.params, ['name']);
	
	reader.template.virtual[params.name] = new TT.VirtualTemplate(params.name, reader.template, info, this);
};
TT.controlStructures.template.prototype.templates = {};
TT.controlStructures.template.prototype.open = function(info) {
	if (!this.display) {
		this.reader.jump(info.closeIndex);
	}
};
TT.controlStructures.template.prototype.close = function(info) {
	if (this.display) {
		this.display = false;
		if (this.displayInfo) {
			this.reader.index = this.displayInfo.statementIndex+1;
			this.reader.sliceIndex = this.displayInfo.resultIndex;
		}
	}
	
	return true;
};

TT.functions.display = function(params, displayInfo) {
	params = this.parseParams(params, ['name']);
	var data, 
		name = params.name;
	delete params.name;
	var data = this.data.clone(params);
	this.template.evaluate(name, data, this.getCallback());
};
