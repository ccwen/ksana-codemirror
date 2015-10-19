var findRange=function(sels,sel) {
	for (var i=0;i<sels.length;i++) {
		var s=sels[i];
		if (JSON.stringify(s)==JSON.stringify(sel)) return i;
	}
	return -1;
}
//move newly added selected to bottom of array
//because codemirror:normalizeSelection will sort the ranges
var arrangeRanges=function(current,prev) {
	var out=[],newly=[];
	for (var i=0;i<current.length;i++) {
		var cur=current[i];
		if (findRange(prev,cur)==-1) {
			newly.push(cur);
		} else {
			out.push(cur);
		}
	}
	out=out.concat(newly);
	return out;
}
var getSelections=function(doc,prev) {
	var out=[];
	var sels=doc.listSelections();

	for (var i=0;i<sels.length;i++) {
		var sel=sels[i];
		var to=[sel.anchor.ch,sel.anchor.line];
		var from=[sel.head.ch,sel.head.line];
		if (JSON.stringify(sel.anchor)===JSON.stringify(sel.head)) {
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

	if (prev) {
		//out=arrangeRanges(out,prev);
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