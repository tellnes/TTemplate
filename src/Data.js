/**
 * @class 
**/
TT.Data = function(data) {
	if (data instanceof TT.Data) {
		this.scopes = data.scopes.slice(0);
	} else {
		this.scopes = [TT.defaultData];
		this.addScope(data);
	}
};
TT.Data.prototype.addScope = function(data) {
	this.scopes.push(data || {});
	this.current = this.scopes[this.scopes.length-1];
	return this.scopes.length-1;
};
TT.Data.prototype.removeScope = function(index) {
	if (Object.isNumber(index)) {
		return this.scopes.splice(index, this.scopes.length-index);
	} else {
		return [this.scopes.pop()];
	}
};
TT.Data.prototype.clone = function(data) {
	var d = new TT.Data(this);
	d.addScope(data || {});
	return d;
};
TT.Data.prototype.get = function(key) {
	var i;
	for(i = this.scopes.length; i--;) {
		if (key in this.scopes[i]) { 
			return this.scopes[i][key];
		}
	}
};
TT.Data.prototype.set = function(key, value) {
	this.current[key] = value;
};
TT.Data.prototype.has = function(key) {
	var i;
	for(i = this.scopes.length; i--; ) {
		if (key in this.scopes[i]) { 
			return true;
		}
	}
};