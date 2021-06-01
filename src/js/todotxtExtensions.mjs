function RecExtension() {
	this.name = "rec";
}
RecExtension.prototype = new TodoTxtExtension();
RecExtension.prototype.parsingFunction = function(line) {
	var rec = null;
	var recRegex = /rec:([hbdwmy]|[1-9][0-9]*[hbdwmy])/;
	var matchRec = recRegex.exec(line);
	if ( matchRec !== null ) {
		rec = matchRec[1];
		return [rec, line.replace(recRegex, ''), matchRec[1]];
	}
	return [null, null, null];
};

export { RecExtension };
