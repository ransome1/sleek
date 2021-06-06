function RecExtension() {
	this.name = "rec";
}
RecExtension.prototype = new TodoTxtExtension();
RecExtension.prototype.parsingFunction = function(line) {
	var rec = null;
	var recRegex = /rec:(\+?[0-9]*[hbdwmy])/;
	var matchRec = recRegex.exec(line);
	if ( matchRec !== null ) {
		rec = matchRec[1];
		return [rec, line.replace(recRegex, ''), matchRec[1]];
	}
	return [null, null, null];
};

export { RecExtension };

function SugarDueExtension() {
	this.name = "due";
}
SugarDueExtension.prototype = new TodoTxtExtension();
SugarDueExtension.prototype.parsingFunction = function(line) {
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

export { SugarDueExtension };