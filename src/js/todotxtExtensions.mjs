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
SugarDueExtension.prototype.parsingFunction = function (line) {
	var dueDate = null;
	var indexDueKeyword = line.indexOf("due:");

	// Find keyword due
	if (indexDueKeyword > 0) {
		var stringAfterDue = line.substr(indexDueKeyword + 4)
		var words = stringAfterDue.split(" ");
		var match = null;
		
		// Try to parse a valid date until the end of the text
		for (var i = 1; i <= words.length; i++) {
			match = words.slice(0, i).join(" ");
			dueDate = Sugar.Date.create(match);
			if (Sugar.Date.isValid(dueDate)) {
				return [dueDate, line.replace("due:" + match, ''), Sugar.Date.format(dueDate, '%Y-%m-%d')];
			}
		}
	}
	return [null, null, null];
};

export { SugarDueExtension };