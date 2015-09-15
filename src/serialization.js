
var itemstojson=function(obj){ //json friendly to github diff
	var out="";
	if (Array.isArray(obj)) {
		for (var i in obj) {
			out+="\n"+JSON.stringify(obj[i])+",";
		}		
		return '['+out.substr(0,out.length-1)+'\n]';
	} else {
		for (var i in obj) {
			out+='\n"'+i+'":'+JSON.stringify(obj[i])+",";
		}		
		return '{'+out.substr(0,out.length-1)+'\n}';
	}
	
}
var serialize=function(meta,text,history,markups) {
	if (typeof text !=="string") {
		var cm=text;
		var doc=cm.getDoc();
		text=doc.getValue();
		history=doc.getHistory().done;
		markups=require("./markups").extractMarkups(doc);
	}
	var aux="{"
		+'"markups":'+itemstojson(markups)
		+'\n,"history":'+itemstojson(history)
		+"\n}";

	meta.textsize="0x00000000";//fix length

	var metastr=JSON.stringify(meta)+"\n";
	var textsize=text.length;
	var size="00000000"+textsize.toString(16);
	meta.textsize="0x"+size.substr(size.length-8);
	var metastr=JSON.stringify(meta)+"\n";

	return metastr+text+aux;
}

var parseFile=function(buffer) {
	var idx=buffer.indexOf("\n");
	if (idx===-1) return null;

	try {
		var meta=JSON.parse(buffer.substr(0,idx).trim());
		meta.textsize = parseInt(meta.textsize) || buffer.length-(idx+1); //for new ktx file
		var aux=buffer.substring(idx+1+meta.textsize);
		aux=aux?JSON.parse(aux):{};
	} catch(e) {
		console.log(e);
		return null;
	}

	return {meta:meta, history: aux.history, markups:aux.markups, value:buffer.substr(idx+1,meta.textsize)};
}
var deserialize=function(buffer) {
	var parts=parseFile(buffer);
	if (!parts) return null;

	//convert markups pointer
	return parts;
}



module.exports={serialize:serialize,deserialize:deserialize};