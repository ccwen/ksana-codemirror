/**
	put markups into CodeMirror
	do not use markups after this call
*/
var reservedfields={doc:true,lines:true,type:true,id:true,key:true}; //don't know id exists

var clearAllMarks=function(doc){
	var marks=doc.getAllMarks();
	for (var i in marks) {
		marks[i].clear();
	}
}
var applyMarkups=function(cm,markups,clear) {
	if (clear) clearAllMarks(cm.getDoc());
	for (var key in markups) {
		var m=markups[key];
		if (!m.from) continue; //already in view
		var fromch=m.from[0],fromline=m.from[1];
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
		cm.markText({line:fromline,ch:fromch},{line:toline,ch:toch}, m );
	}
}

/**
	extract markups from CodeMirror
*/
var extractMarkups=function(doc) {
	var marks=doc.getAllMarks();
	var markups={};

	for (var i=0;i<marks.length;i++) {
		var obj={};
		var m=marks[i];
		var pos=m.find();
		obj.from=[pos.from.ch,pos.from.line];
		obj.to=pos.to.ch;
		if (pos.from.line!==pos.to.line) to=[to,pos.to.line];
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