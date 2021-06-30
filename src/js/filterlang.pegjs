{{
    import { addIntervalToDate } from "./recurrences.mjs";
}}

filterQuery
    = _ left:orExpr _  { return left; }
    / _ { return []; }

orExpr
    = left:andExpr _ OrOp _ right:orExpr { return left.concat(right, ["||"]); }
    / left:andExpr { return left; }

andExpr
    = left:notExpr _ AndOp _ right:andExpr { return left.concat(right, ["&&"]); }
    / left:notExpr { return left; }

notExpr
    = NotOp _ left:notExpr { return left.concat(["!!"]); }
    / left:boolExpr { return left; }

boolExpr
    = left:project { return left; }
    / left:context { return left; }
    / "(" _ left:orExpr _ ")" { return left; }
    / left:comparison  { return left; }
    / "complete"  { return ["complete"]; }
    / left:StringLiteral  { return ["string", left]; }
    / left:RegexLiteral  { return ["regex", left]; }

project
    = "+" left:name      { return ["++", left]; }
    / "+"               { return ["++", "*"]; }

context
    = "@" left:name      { return ["@@", left]; }
    / "@"               { return ["@@", "*"]; }

OrOp
    = "||"
    / "or"i

AndOp
    = "&&"
    / "and"i

NotOp
    = "!"
    / "not"i

comparison
    = left:priorityComparison { return left; }
    / left:dueComparison { return left; }

priorityComparison
    = priorityKeyword _ op:compareOp _ right:priorityLiteral  { return ["pri", right, op]; }
    / priorityKeyword  { return ["pri"]; }
    / "(" right:priorityLiteral ")"  { return ["pri", right, "=="]; }

priorityLiteral
    = [A-Z]  { return text(); }

priorityKeyword
    = "pri" ("o" ("r" ("i" ("t" "y"?)?)?)?)?

dueComparison
    = "due" _ op:compareOp _ right:dateExpr  { return ["due"].concat(right, [op]); }
    / "due:" right:dateStr  { return ["duestr", right]; }
    / "due"  { return ["due"]; }

dateExpr
    = left:dateLiteral _ op:dateOp _ count:number unit:[dbwmy]  {
        if (op == "-") {
            count = count * -1;
        }
        // we do our date math with the same code as we use for
        // recurrence calculations.  All dates are returned from
        // the parser as millisec since epoch (getTime()) to
        // simplify comparisons in the filter lang execution engine.
        let d = addIntervalToDate(new Date(left), count, unit);
        return d.getTime();
    }
    / left:dateLiteral  { return left; }

dateOp
    = "+"  { return text(); }
    / "-"  { return text(); }

compareOp
    = "=="  { return text(); }
    / "="   { return "==";   }
    / "!="  { return text(); }
    / ">="  { return text(); }
    / "<="  { return text(); }
    / ">"   { return text(); }
    / "<"   { return text(); }

dateStr
    = [0-9]+ ("-" [0-9]+ ("-" [0-9]+)?)? { return text(); }

dateLiteral
    = year:number4 "-" month: number2 "-" day:number2  {
    	let d = new Date(year, month-1, day);
        return d.getTime();
    }
    / year:number4 "-" month: number2  {
    	let d = new Date(year, month-1, 1);
        return d.getTime();
    }
    / year:number4  {
    	let d = new Date(year, 0, 1);
        return d.getTime();
    }
    / "today" {
    	let d = new Date();  // now, w current time of day
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return d.getTime();
    }
    / "tomorrow" {
        let d = new Date();  // now, w current time of day
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return d.getTime() + 24*60*60*1000;
    }
    / "yesterday" {
        let d = new Date();  // now, w current time of day
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return d.getTime() - 24*60*60*1000;
    }

number4
    = [0-9][0-9][0-9][0-9] { return text(); }

number2
    = [0-9][0-9] { return text(); }

number
    = [0-9]+ { return text(); }

StringLiteral "string"
    = '"' chars:DoubleStringCharacter* '"'? {
        return chars.join("");
    }
    / "'" chars:SingleStringCharacter* "'"? {
        return chars.join("");
    }

DoubleStringCharacter
    = '\\' '"' { return '"'; }
    / !'"' SourceCharacter { return text(); }

SingleStringCharacter
    = '\\' "'" { return "'"; }
    / !"'" SourceCharacter { return text(); }

RegexLiteral "regex"
    = "/" chars:RegexCharacter* "/"  "i" {
        return new RegExp(chars.join(""), "i");
    }
    / "/" chars:RegexCharacter* "/"? {
        return new RegExp(chars.join(""));
    }

RegexCharacter
    = "\\" "/" { return "/"; }
    / !"/" SourceCharacter { return text(); }

SourceCharacter
    = .

name
	= '"' nonblank+ '"'         { return text(); }
	/ nonblankparen+  '"'       { return '"' + text(); }
	/ nonblankparen+            { return text(); }

nonblank
    = [^ \t\n\r"]

nonblankparen
    = [^ \t\n\r"()]

_ "whitespace"
  = [ \t\n\r]*
