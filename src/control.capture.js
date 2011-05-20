/**
 * @class 
**/
TT.controlStructures.capture = function(reader, info) {
	this.reader = reader;
	this.params = this.reader.parseParams(info.params);
	this.content = '';
};
TT.controlStructures.capture.prototype.addContent = function(content) {
	this.content += content;
};
TT.controlStructures.capture.prototype.open = function() {
	this.reader.addContent = this.addContent.bind(this);
};
TT.controlStructures.capture.prototype.close = function() {
	if (this.params.assign) {
		this.reader.data.set(this.params.assign, this.content);
	}
	if (this.params.name) {
		if (!this.reader.templateData.capture) { this.reader.templateData.capture = {}; }
		this.reader.templateData.capture[this.params.name] = this.content;
	}
	
	this.reader.addContent = TT.Reader.prototype.addContent;
};
