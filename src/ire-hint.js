// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
//if (var IRE=require("ksana-ire");
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var WORD = /[\w$]+/, RANGE = 500;
  var hint=function(cm,self,data) {
    cm.getDoc().replaceRange(data.text,self.from,self.to);
    var from={line:self.from.line, ch:self.from.ch+data.text.length-1};
    var to={line:self.to.line, ch:self.to.ch+data.text.length-1};
    cm.getDoc().setSelection(from,to);
    return data;
  }
  CodeMirror.registerHelper("hint", "ire", function(editor, options) {
    var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
    var tofind=curLine[cur.ch-1];
    var candidates=IRE.getDerived(tofind);
    var list=candidates.map(function(candidate){
      var displayText=candidate;
      var text=String.fromCharCode(0x2fff)+displayText+tofind+"卍";
      return {text:text,displayText:displayText,hint:hint}
    });

    var parts=IRE.getUnicodeParts(tofind);
    parts.map(function(part){
      var text=String.fromCharCode(0x2fff)+tofind+part+"卍";
      var first={text:text,displayText:tofind+part+"●",hint:hint};
      list.unshift(first);
    });

    return {list: list, from: {line:cur.line,ch:cur.ch-1}, to:cur};
  });
});
