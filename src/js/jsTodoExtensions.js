/*!
	Extensions to the todo.txt format
*/

function TodoTxtExtension( name ) {
	this.reset = function () {
		this.name = null;
		this.parsingFunction = null;
	};
	// The parsing function should return an array containing
	// the real value of the element, the parsed task line and
	// the string representation of the value.
	this.parsingFunction = function ( line ) {
		return [null, null, null];
	};
}

function HiddenExtension() {
	this.name = "h";
}

HiddenExtension.prototype = new TodoTxtExtension();
HiddenExtension.prototype.parsingFunction = function(line) {
	var hidden = null;
	var hiddenRegex = /\bh:1\b/;
	var matchHidden = hiddenRegex.exec( line );
	if ( matchHidden !== null ) {
		hidden = true;
	}
	return [hidden, line.replace(hiddenRegex, ''), hidden ? '1' : null];
};

function DueExtension() {
	this.name = "due";
}
DueExtension.prototype = new TodoTxtExtension();
DueExtension.prototype.parsingFunction = function(line) {
	var dueDate = null;
	var dueRegex = /due:([0-9]{4}-[0-9]{1,2}-[0-9]{1,2})\s*/;
	var matchDue = dueRegex.exec(line);
	if ( matchDue !== null ) {
		var datePieces = matchDue[1].split('-');
		dueDate = new Date( datePieces[0], datePieces[1] - 1, datePieces[2] );
		return [dueDate, line.replace(dueRegex, ''), matchDue[1]];
	}
	return [null, null, null];
};

// Exported functions for node
(function(exports){

	exports.TodoTxtExtension = TodoTxtExtension;
	exports.HiddenExtension = HiddenExtension;
	exports.DueExtension = DueExtension;

})(typeof exports === 'undefined' ? window : exports);
