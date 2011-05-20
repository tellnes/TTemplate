TT.prototype.display = function (name, element, callback) {
	if (!(element = $(element))) { return; }
	
	this.fetch(name, function (temp) {
		element.innerHTML = temp;
		callback(element, temp);
	});
};


TT.getFile = function (file, callback) {
	new Ajax.Request(file, {
		method: 'GET',
		onSuccess: function (response) {
			callback(response.responseText);
		}
	});
};

TT.noop = Prototype.emptyFunction;

Object.extend(TT.modifiers.all, {
	"isElement": Object.isElement.methodize(),
	"isNumber": Object.isNumber.methodize(),
	"isString": Object.isString.methodize(),
	"isDate": Object.isDate.methodize(),
	"isUndefined": Object.isUndefined.methodize(),
	"isArray": Object.isArray.methodize(),

	"inspect": Object.inspect.methodize(),
	"toJSON": Object.toJSON.methodize(),
	"toHTML": Object.toHTML.methodize()
});
Object.extend(TT.modifiers.object, {
	"keys": Object.keys.methodize(),
	"values": Object.values.methodize(),
	"toQueryString": Object.toQueryString.methodize(),
	
	"sortBy": function (by) {
		var list = this;
		if (Object.isHash(this)) {
			list = this.map(function (item) {
				return item[1];
			});
		}
		return list.sort(function (left, right) {
			var a = left[by], b = right[by];
			return a < b ? -1 : a > b ? 1 : 0;
		});
	},
	
	"pluck": Enumerable.pluck
	
});
Object.extend(TT.modifiers.string, {
	regex_replace: function (regexp, replace) {
		return this.gsub(new RegExp(regexp.slice(1, -1)), replace);
	}
});
