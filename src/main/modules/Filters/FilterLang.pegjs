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
    / left:thresholdComparison { return left; }

priorityComparison
    = priorityKeyword _ op:compareOp _ right:priorityLiteral  { return ["pri", right, op]; }
    / priorityKeyword  { return ["pri"]; }
    / "(" right:priorityLiteral ")"  { return ["pri", right, "=="]; }

priorityLiteral
    = [A-Z]  { return text(); }

priorityKeyword
    = "pri" ("o" ("r" ("i" ("t" "y"?)?)?)?)?

dueComparison
    = "due:" _ op:compareOp _ right:dateExpr  { return ["due"].concat(right, [op]); }
    / "due:" right:dateStr  { return ["duestr", right]; }  // this does string prefix match
    / "due:"  { return ["due"]; }  // this tests for the presence of any due date

thresholdComparison
    = "t:" _ op:compareOp _ right:dateExpr  { return ["threshold"].concat(right, [op]); }
    / "t:" right:dateStr  { return ["tstr", right]; }  // this does string prefix match
    / "t:"  { return ["threshold"]; }  // this tests for the presence of any due date

dateExpr
    = left:dateLiteral _ op:dateOp _ count:number unit:[dbwmy]  {
        if(count.length == 0) {
            /* empty count string means default "1" value */
            count = 1;
        }
        if(op == "-") {
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
        let m = month > 0 ? (month <= 12 ? month-1 : 11) : 0;
        let d = day > 0 ? (day <= 31 ? day : 31) : 1;  /* ignores lengths of months */
        return new Date(year, m, d).getTime();
    }
    / year:number4 "-" month: number2  {
        let m = month > 0 ? (month <= 12 ? month-1 : 11) : 0;
        return new Date(year, m, 1).getTime();
    }
    / year:number4  {
        return new Date(year, 0, 1).getTime();
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
    = [0-9][0-9]? { return text(); }

number
    = [0-9]* { return text(); }  /* used in date intervals only */

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