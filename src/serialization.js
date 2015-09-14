

var serialize=function(meta,text,history,markups) {
	if (typeof text !=="string") {
		var cm=text;
		var doc=cm.getDoc();
		text=doc.getValue();
		history=doc.getHistory().done;
		markups=require("./markups").extractMarkups(doc);
	}
	var middle=JSON.stringify({markups:markups,history:history},""," ")+"\n";
	meta.textstart="0x00000000";//fix length

	var metastr=JSON.stringify(meta)+"\n";
	var textstart=middle.length+metastr.length;
	var start="00000000"+textstart.toString(16);
	meta.textstart="0x"+start.substr(start.length-8);
	var metastr=JSON.stringify(meta)+"\n";

	return metastr+middle+text;
}

var parseFile=function(buffer) {
	var idx=buffer.indexOf("\n");
	if (idx===-1) return null;

	try {
		var meta=JSON.parse(buffer.substr(0,idx).trim());
		meta.textstart = parseInt(meta.textstart);
		var middle=JSON.parse(buffer.substring(idx+1,meta.textstart)) ;
	} catch(e) {
		console.log(e);
		return null;
	}

	return {meta:meta, history: middle.history, markups:middle.markups, value:buffer.substr(meta.textstart)};
}
var deserialize=function(buffer) {
	var parts=parseFile(buffer);
	if (!parts) return null;

	//convert markups pointer
	return parts;
}



module.exports={serialize:serialize,deserialize:deserialize};