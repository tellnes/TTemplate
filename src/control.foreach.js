/**
 * @class 
**/
TT.controlStructures.foreach = function(reader, info) {
	this.reader = reader;
	
	this.params = this.reader.parseParams(info.params, ['list']);

	if (this.params.name) {
		if (!this.reader.templateData.foreach) { this.reader.templateData.foreach = {}; }
		this.info = reader.templateData.foreach[this.params.name] = {};
	}

	if (Object.isArray(this.params.list)) {
		this.values = this.params.list;
	} else {
		this.values = [];
		this.keys = [];
		var key, list = this.params.list;
		for(key in list) {
			if (list.hasOwnProperty(key)) {
				this.values.push(list[key]);
				this.keys.push(key);
			}
		}
	}

	this.length = this.values.length;
	this.index = 0;
//	console.log('foreach create - ', this.params.item, this.values, this.length, info.params)
	
};
TT.controlStructures.foreach.prototype.open = function(info) {
	if (!this.length) { 
//		console.log('jump', info)
		this.reader.jump(info.closeIndex);
		return; 
	}
//	console.log('foreach open - ', this.params.item, this.index, this.values[this.index]);
	
	if (this.info) {
		this.info.last = (this.index-1 === this.length);
		this.info.first = !this.index;
		this.info.index = this.index;
		this.info.iteration = this.index+1;
	}

	var data = {};
	this.dataScopeIndex = this.reader.data.addScope(data);

	if (this.params.item) { data[this.params.item] = this.values[this.index]; }
	if (this.params.value) { data[this.params.value] = this.values[this.index]; }
	if (this.params.key && this.keys) { data[this.params.key] = this.keys[this.index]; }
	if (this.params.index) { data[this.params.index] = this.index; }
	
	this.index++;
};
TT.controlStructures.foreach.prototype.close = function(info) {
//	console.log('foreach close - ', this.params.item, this.index)
	
	if (this.length > this.index) {
		this.reader.jump(info.openIndex);
		return true;
	} else {
		this.reader.data.removeScope(this.dataScopeIndex);
		return false;
	}
};