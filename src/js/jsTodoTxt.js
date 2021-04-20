var TodoTxtExtension;
if (typeof require === 'function') {
	TodoTxtExtension = require('./jsTodoExtensions').TodoTxtExtension;
} else {
	TodoTxtExtension = window.TodoTxtExtension;
}

/*!
	Shared members and static functions.
*/
var TodoTxt = {

	// Pre-compile Shared RegExes
	_trim_re:             /^\s+|\s+$/g,

	_complete_re:         /^x\s([0-9]{4}-[0-9]{1,2}-[0-9]{1,2})\s+/i,
	_complete_replace_re: /^x\s([0-9]{4}-[0-9]{1,2}-[0-9]{1,2})\s+/i,

	_date_re:             /^([0-9]{4}-[0-9]{1,2}-[0-9]{1,2})/,
	_date_replace_re:     /^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}\s*/,

	_priority_re:         /^\(([A-Z])\)/,
	_priority_replace_re: /^\([A-Z]\)\s*/,

	_context_re:         /(^|\s+)@(\S+)/g,
	_context_replace_re: /\s*@\S+\s*/g,

	_project_re:          /(^|\s+)\+(\S+)/g,
	_project_replace_re:  /\s*\+\S+\s*/g,

	/*!
		Parse a string of lines.

		\param contents A string
		\param extensions An array of TodoTxtExtension objects (optional)

		\returns An array of TodoTxtItem objects.
	*/
	parse: function ( contents, extensions, onError ) {
		var items = [],
			lines = contents.split( "\n" ),
			i;
		for(i = 0; i < lines.length; i++) {
			try {
				items.push( new TodoTxtItem( lines[i], extensions ) );
			}
			catch ( error ) {
				if (onError !== undefined) {
					onError(error)
				}
			}
		}
		return items;
	},

	/*!
		Parses a single line into a TodoTxtItem object.

		\param line A string.

		\returns A TodoTxtItem object representing that line.
	*/
	parseLine: function ( line ) {
		return new TodoTxtItem( line );
	},

	/*!
		Render an array of items into string.

		\param items An array of valid TodoTxtItem objects.

		\returns A string representation of the items.
	*/
	render: function( items ) {
		var lines = [],
			i;
		for( i in items ) {
			if( items.hasOwnProperty(i) ) {
				lines.push( items[i].toString() );
			}
		}
		return lines.join( "\n" );
	},

	/*
		Render a single item to a single line. No newline.

		\param item A valid TodoTxtItem object

		\returns A string representation of the item.
	*/
	renderItem: function ( item ) {
		return item.toString();
	}

};

function TodoTxtItem ( line, extensions ) {


	this.reset = function () {
		this.text      = null;
		this.priority  = null;
		this.complete  = false;
		this.completed = null;
		this.date      = null;
		this.contexts  = null;
		this.projects  = null;
	};

	this.dateString = function () {
		if( this.date ) {
			return this.date.getFullYear() + '-' +
				( ( this.date.getMonth() + 1 < 10 ) ? '0' : '' ) + ( this.date.getMonth() + 1 ) + '-' +
				( ( this.date.getDate() < 10 ) ? '0' : '' ) + this.date.getDate();
		}
		return null;
	};

	this.completedString = function () {
		if( this.completed ) {
			return this.completed.getFullYear() + '-' +
				( ( this.completed.getMonth() + 1 < 10 ) ? '0' : '' ) + ( this.completed.getMonth() + 1 ) + '-' +
				( ( this.completed.getDate() < 10 ) ? '0' : '' ) + this.completed.getDate();
		}
		return null;
	};

	/*!
		Render this object to a string.

		\returns A string representation of this object.
	*/
	this.toString = function () {
		var line = this.text;
		if( null !== this.date ) { line = this.dateString() + ' ' + line; }
		if( null !== this.priority ) { line = '(' + this.priority + ') ' + line; }
		if( this.complete && null !== this.completed ) { line = 'x ' + this.completedString() + ' ' + line; }
		if( '' !== this.extensionStrings() ) { line = line + this.extensionStrings(); }
		if( null !== this.projects ) { line = line + ' +' + this.projects.join( ' +' ); }
		if( null !== this.contexts ) { line = line + ' @' + this.contexts.join( ' @' ); }
		return line;
	};

	this.extensionStrings = function () {
		var extensionString = "";
		if ( null !== this.extensions ) {
			var len;
			var i;
			for (i = 0, len = this.extensions.length; i < len; i++) {
				if ( "undefined" !== typeof(this[this.extensions[i].name + "String"])) {
					extensionString = extensionString + ' '
						+ this.extensions[i].name + ':'
						+ this[this.extensions[i].name + "String"];
				}
			}
		}
		return extensionString;
	}

	/*!
		Parse a string into this object.

		\param line A string in todo.txt format to parse.
	*/
	this.parse = function ( line ) {
		var date_pieces;

		this.reset();

		// Trim whitespace
		line = line.replace( TodoTxt._trim_re, '');

		// Time \r from Windows :-P
		line = line.replace( "\r", '' );

		// Completed
		var complete = TodoTxt._complete_re.exec( line );
		if( null !== complete ) {
			this.complete = true;
			date_pieces = complete[1].split('-');
			this.completed = new Date( date_pieces[0], date_pieces[1] - 1, date_pieces[2] );
			line = line.replace( TodoTxt._complete_replace_re, '' );
		}

		// Priority
		var priority = TodoTxt._priority_re.exec( line );
		if( null !== priority ) {
			this.priority = priority[1];
			line = line.replace( TodoTxt._priority_replace_re, '' );
		}

		// Date
		var date = TodoTxt._date_re.exec( line );
		if( null !== date ) {
			date_pieces = date[1].split('-');
			this.date = new Date( date_pieces[0], date_pieces[1] - 1, date_pieces[2] );
			line = line.replace( TodoTxt._date_replace_re, '' );
		}

		// Context
		var contexts = line.match( TodoTxt._context_re );
		if( null !== contexts ) {
			var i;
			this.contexts = [];
			for(i = 0; i < contexts.length; i++) { this.contexts.push( contexts[i].trim().substr( 1 ) ); }
			line = line.replace( TodoTxt._context_replace_re, ' ' );
		}

		// Project
		var projects = line.match( TodoTxt._project_re );
		if( null !== projects ) {
			this.projects = [];
			for(i = 0; i < projects.length; i++) { this.projects.push( projects[i].trim().substr( 1 ) ); }
			line = line.replace( TodoTxt._project_replace_re, ' ' );
		}

		// Extensions
		if ( null !== this.extensions ) {
			var len;
			for(i = 0, len = this.extensions.length; i < len; i++) {
				if ( this.extensions[i] instanceof TodoTxtExtension) {
					var parsed = this.extensions[i].parsingFunction( line );
					var nameValue = parsed[0];
					var parsedLine = parsed[1];
					var stringRepresentation = parsed[2];
					if ( null !== parsedLine ) {
						line = parsedLine;
					}

					if ( null !== nameValue ) {
						this[this.extensions[i].name] = nameValue;
					}

					if ( null !== stringRepresentation ) {
						this[this.extensions[i].name + "String"] = stringRepresentation;
					}
				}
			}
		}

		// Trim again to clean up
		line = line.replace( TodoTxt._trim_re, '');

		this.text = line;
	};

	this._getNumOfNulls = function( lhs, rhs ) {
		if( lhs == null && rhs == null ) {
			return 2;
		}
		if( lhs == null || rhs == null ) {
			return 1;
		}
		return 0;
	}

	this._arraysAreEqual = function( lhs, rhs ) {
		if( this._getNumOfNulls( lhs, rhs ) == 2 ) {
			return true;
		}
		if( this._getNumOfNulls( lhs, rhs ) == 1 ) {
			return false;
		}
		if( lhs.length != rhs.length ) {
			return false;
		}
		for( item in lhs ) {
			var item;
			if ( rhs.indexOf(lhs[item]) == -1 ) {
				return false;
			}
		}
		// if we get here, there is an equal number of elements
		// and all lhs elements are in the rhs
		return true;
	}

	this._datesAreEqual = function( lhs, rhs ) {
		if( this._getNumOfNulls( lhs, rhs ) == 2 ) {
			return true;
		}
		if( this._getNumOfNulls( lhs, rhs ) == 1 ) {
			return false;
		}
		return (lhs.setHours(0,0,0,0) - rhs.setHours(0,0,0,0)) == 0;
	}

	this.equals = function( todo ) {
		var dates = ["date", "completed"];
		var i;
		for( i in dates ) {
			if( !this._datesAreEqual(this[dates[i]], todo[dates[i]]) ) {
				return false;
			}
		}
		var simpleCompares = ["complete", "priority", "text"];
		for( i in simpleCompares ) {
			if( this[simpleCompares[i]] != todo[simpleCompares[i]] ) {
				return false;
			}
		}
		var arrays = ["projects", "contexts"];
		for( i in arrays ) {
			if( !this._arraysAreEqual(this[arrays[i]], todo[arrays[i]]) ) {
				return false;
			}
		}
		return true;
	};

	// If extensions were specified, use them
	if ( ("object" == typeof( extensions ) ) && (extensions.length > 0 ) ) {
		this.extensions = extensions;
	}
	else {
		this.extensions = null;
	}
	// If we were passed a string, parse it.
	if( "string" === typeof( line ) ) {
		this.parse( line );
	}
	else {
		this.reset();
	}

}

// Exported functions for node
(function(exports){

	exports.TodoTxt = TodoTxt;
	exports.TodoTxtItem = TodoTxtItem;

})(typeof exports === 'undefined' ? window : exports);
