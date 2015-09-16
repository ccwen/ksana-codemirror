var getSelections=function(doc) {
	var out=[];
	var sels=doc.listSelections();

	for (var i=0;i<sels.length;i++) {
		var sel=sels[i];
		var to=[sel.anchor.ch,sel.anchor.line];
		var from=[sel.head.ch,sel.head.line];
		if (sel.anchor===sel.head) {
			out.push([from]);//caret pos only
		} else {
			if ((from[1]==to[1]&& from[0]>to[0]) || (from[1]>to[1])) {
				t=from;
				from=to;
				to=t;
			}
			out.push([from,to]);			
		}
	}
	return out;
}

var	getCharAtCursor = function(doc) {
		var cursorch="";
		var cursor=doc.getCursor();
		var line=doc.getLine(cursor.line);
		var ch=cursor.ch-1;//the char before cursor
		if (!line) return "";
		var cursorch=line[ch];
		if (!cursorch) return "";

		var code=cursorch.charCodeAt(0);
		if (code>=0xD800 && code<0xDC00) {
			cursorch+=line[ch+1];
		}
		return cursorch;
	}


module.exports={getSelections:getSelections,getCharAtCursor:getCharAtCursor};