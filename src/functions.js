TT.functions = { };

TT.functions.cycle = function(params) {
	params = this.parseParams(params);
	// TODO: implement
	// http://www.smarty.net/docsv2/en/language.function.cycle.tpl
};

TT.functions.assign = function(params) {
	params = this.parseParams(params, ['var', 'value']);
	
	this.data.set(params['var'], params.value);
};
TT.functions.counter = function(params) {
	params = this.parseParams(params);
	
	if (!this.templateData.counter) { this.templateData.counter = {}; }
	
	var info = this.templateData.counter[params.name || 'default'];
	if (!info) {
		info = this.templateData.counter[params.name || 'default'] = {
			name: 'default',
			start: 1,
			skip: 1,
			direction: 'up',
			print: true,
			assign: null
		};
	}
	Object.extend(info, params);
	
	if (!('_counter' in info) || 'start' in params) {
		info._counter = info.start;
	} else {
		info._counter += info.skip*(info.direction === 'down' ? -1 : 1);
	}
	
	if (info.assign) {
		this.data.set(info.assign, info._counter);
	}

	return (info.print && !info.assign ? info._counter : '');
};

TT.functions.include = function(params) {
	params = this.parseParams(params, ['file']);
	
	var callback = this.getCallback(), 
	//	assign = params.assign, 
		that = this;
	
	TT.loadTemplate(params.file, function(template) {
		delete params.assign;
		delete params.file;
		var data = that.data.clone(params);
//		data.addScope(params);
		
		new TT.Reader(template, data, callback);
	});
	
/*
	if (assign) {
		this.assign(assign, c.text);
		return "";
	} else {
		return c.text;
	}
	*/
};


TT.functions.debug = function(params) {
	console.log( this.parseVar(params) );
};
