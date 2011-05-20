TT.modifiers = (function() {
	function length() {
		return this.length;
	}
	
	function Default(d) {
		return (this ? this : d);
	}
	
	
	function indent(times, character) {
		var i = (character || ' ').times(times || 4);
		return i+this.split("\n").join("\n"+i);
	}

	function nl2br() {
		return this.split("\n").join("<br>");
	}
	function spacify(character) {
		return this.split('').join(character || ' ');
	}


	return {
		"all": {
			length: length,
			"default": Default
		},
		"number": {},
		"string": {
			"indent": indent,
			"nl2br": nl2br,
			"spacify": spacify,
			
			"upper": String.prototype.toUpperCase,
			"lower": String.prototype.toLowerCase
		},
		"boolean": {},
		"object": {},
		"undefined": {},
		"function": {}
	};
}());
