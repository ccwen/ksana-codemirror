
var findMilestone = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  if (high===0) return -1;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid][0]==obj) return mid;
    array[mid][0] < obj ? low = mid + 1 : high = mid;
  }
  if (near) return low;
  else if (low<array.length&&array[low][0]==obj) return low;else return -1;
};

var buildMilestone=function(doc,markups) {
	var name2milestone={},line2milestone=[];

	for (var i in markups) {
		var m=markups[i];
		if (m.className!=="milestone") continue;
		var cur=m.handle.find();
		var t=doc.getRange(cur.from,cur.to);
		name2milestone[t]=m.handle;
		line2milestone.push([cur.from.line,t,cur.from.ch,cur.to.ch]);
	}
	line2milestone.sort(function(a,b){
		return a[0]-b[0];
	});
	doc.name2milestone=name2milestone;
	doc.line2milestone=line2milestone;
}
var abs2milestone=function(line) {

	var idx=findMilestone(this.line2milestone,line,true)-1;
	if (idx<0||idx>=this.line2milestone.length) return [line];
	var ms=this.line2milestone[idx];
	if (line===ms[0]) return [line]; //fix line before first milestone = -1
	return [(line-ms[0]-1),ms[1]]; //  [line offset, milestone_caption]
}

var milestone2abs=function( name, offsetline) {
	var ms=this.name2milestone[name];
	if (!ms) return offsetline;

	var pos=ms.find();
	return pos.from.line+offsetline;

}

var lineNumberFormatter=function(line){
	var doc=this.codeMirror.getDoc();
	if (!doc) return "";
	if (!doc.line2milestone || !doc.line2milestone.length)return line;
	var ms=abs2milestone.call(doc,line)[0];
	return ms;
}

var unpack=function(r) {
	var o=[];
	if (r.length!==2)return r;
	if (typeof r[1]==="number") r[1]=[r[1]];
	o[0]=[r[0][0],r[0][1]];
	o[1]=[r[1][0],r[1][1]];

	if (typeof r[0][2]==="string") {
		o[0][1] = milestone2abs.call(this,r[0][2],r[0][1]);
	}

	if (typeof r[1][2]==="string") {
		o[1][1] = milestone2abs.call(this,r[1][2],r[1][1]);
	}

	if (r[1].length==1) {//same line
		o[1][1]=o[0][1];
	}
	return o;
}

var pack=function(r) {
	var o=[];
	if (r.length!==2)return r;
	if (typeof r[0][2]==="string") return r; //already pack

	o[0]=[r[0][0]].concat(abs2milestone.call(this,r[0][1]+1));

	if (r[1][1]===r[0][1]) {
		o[1]=r[1][0]; //same line
	} else {
		o[1]=[r[1][0]].concat(abs2milestone.call(this,r[1][1]+1));	
	}
	
	return o;
}
module.exports={lineNumberFormatter:lineNumberFormatter,findMilestone:findMilestone,
	abs2milestone:abs2milestone,buildMilestone:buildMilestone,unpack:unpack,pack:pack};