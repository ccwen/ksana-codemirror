/**
	put markups into CodeMirror
	do not use markups after this call
*/
var reservedfields={doc:true,lines:true,type:true,id:true,key:true,replacedWith:true
	,clearWhenEmpty:true,collapsed:true,widgetNode:true,atomic:true,handle:true}; //don't know id exists

var clearAllMarks=function(doc){
	var marks=doc.getAllMarks();
	for (var i in marks) {
		marks[i].clear();
	}
}

var applyBookmark=function(cm,bookmark) {
	var func="bookmark_"+bookmark.className;
	if (cm.react && cm.react[func]) {
		cm.getDoc().setCursor({line:bookmark.from[1] ,ch:bookmark.from[0]});
		return cm.react[func].call(cm.react,bookmark);
	}
	return null;
}

var applyMarkups=function(cm,markups,clear) {
	if (clear) clearAllMarks(cm.getDoc());
	for (var key in markups) {
		var m=markups[key];
		if (m.handle) continue; //already in view
		var fromch=m.from[0],fromline=m.from[1];

		if (typeof m.to==="undefined") {
			m.key=key;
			applyBookmark(cm,m).handle;
			delete m.from;
			continue;
		}

		if (typeof m.to==="number") {
			toch=m.to;
			toline=fromline;
		}  else {
			toch=m.to[0];
			toline=m.to[1];
		}
		delete m.from;
		delete m.to;

		for (var i in m) {
			if (reservedfields[i]) delete m[i];
		}
		m.key=key; //probably from firebase uid
		m.handle=cm.markText({line:fromline,ch:fromch},{line:toline,ch:toch}, m );		
	}
}

/**
	extract markups from CodeMirror
*/
var extractBookmark=function(textmarker, pos) {
	var out={from:[pos.ch,pos.line]};
	for (var i in textmarker) {
		if (typeof textmarker[i]==="function") continue;
		if (!reservedfields[i]) out[i]=textmarker[i];
	}
	return out;
}
var extractMarkups=function(doc) {
	var marks=doc.getAllMarks();
	var markups={};

	for (var i=0;i<marks.length;i++) {
		var obj={};
		var m=marks[i];
		if (m.clearOnEnter) continue; //temporary markup will not be saved
		var pos=m.find();
		if (m.type==="bookmark") {
			obj=extractBookmark(m,pos);
		} else {
			obj.from=[pos.from.ch,pos.from.line];
			obj.to=pos.to.ch;
			if (pos.from.line!==pos.to.line) to=[to,pos.to.line];
		}
		markups[m.key]=obj;

		for (var key in m) {
			if (!m.hasOwnProperty(key))continue;
			if (!reservedfields[key]) {
				obj[key]=m[key];
			}
		}
	}
	return markups;
}

module.exports={applyMarkups:applyMarkups, extractMarkups:extractMarkups};