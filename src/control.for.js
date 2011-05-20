/**
 * @class 
**/
TT.controlStructures['for'] = function(reader, info) {
	this.reader = reader;
	
	this.params = this.reader.parseParams(info.params, ['end']);

	this.end = Number(this.params.end) || 0;
	this.index = Number(this.params.start) || 0;
	this.direction = (this.index < this.end ? 1 : -1);


	if (this.params.name) {
		if (!this.reader.templateData['for']) { this.reader.templateData['for'] = {}; }
		this.info = this.reader.templateData['for'][this.params.name] = {};
		
		this.info.length = (this.end-this.index)*this.direction;
		this.info.start = this.index;
		this.info.end = this.end;
	}
};
TT.controlStructures['for'].prototype.open = function(info) {
	if (this.index === this.end) {
		this.reader.jump(info.closeIndex);
		return; 
	}
	
	var next = this.index+this.direction, data = {};
	
	if (this.info) {
		this.info.index = this.index;
		this.info.last = (next === this.end);
		this.info.first = (this.index === this.start);
	}

	this.dataScopeIndex = this.reader.data.addScope(data);

	if (this.params.item) { data[this.params.item] = this.index; }
	if (this.params.index) { data[this.params.index] = this.index; }
	
	this.index = next;
};
TT.controlStructures['for'].prototype.close = function(info) {
	if (this.index !== this.end) {
		this.reader.jump(info.openIndex);
		return true;
	} else {
		this.reader.data.removeScope(this.dataScopeIndex);
		return false;
	}
};