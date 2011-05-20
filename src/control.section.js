/**
 * @class 
**/
TT.controlStructures.section = function(reader, info) {
	this.reader = reader;
	
	this.params = this.reader.parseParams(info.params, ['list', 'item']);

	if (this.params.name) {
		if (!this.reader.templateData.section) { this.reader.templateData.section = {}; }
		this.info = reader.templateData.section[this.params.name] = {};
	}

	this.list = this.params.list;
	this.length = this.list.length;
	this.index = 0;
	
	this.data = {};
	this.dataScopeIndex = this.reader.data.addScope(this.data);
};
TT.controlStructures.section.prototype.open = function(info) {
	if (!this.length) { return; }
	
	if (this.info) {
		this.info.last = (this.index-1 === this.length);
		this.info.first = !this.index;
		this.info.index = this.index;
		this.info.iteration = this.index+1;
	}

	var item = this.list[this.index];
	this.data[this.params.item] = item;
	if (this.params.key) { this.data[this.params.key] = this.index; }
	
	this.index++;
};
TT.controlStructures.section.prototype.close = function(info) {
	if (this.length > this.index && this.index < 10) {
		this.reader.jump(info.openIndex);
	} else {
		this.reader.data.removeScope(this.dataScopeIndex);
	}
};
