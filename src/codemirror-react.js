var CM = require('codemirror');

require('codemirror/addon/display/panel');
require('codemirror/addon/search/search.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/dialog/dialog.js');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/selection/active-line');
require('./automarkup.js');

var React = require('react');
var ReactDOM = require('react-dom');
var E=React.createElement;

var randomKey=function() {
	return 'm'+Math.random().toString().substr(2,5);
}
var eventKeys=["altKey","ctrlKey","shiftKey","clientX","clientY","pageX","pageY","screenX","screenY","type"];
var CodeMirrorComponent = React.createClass({
	displayName :"CodeMirror"
	,propTypes: {
		onChange: React.PropTypes.func,
		onFocusChange: React.PropTypes.func,
		onCursorActivity: React.PropTypes.func,
		options: React.PropTypes.object,
		path: React.PropTypes.string,
		value: React.PropTypes.string,
		onBeforeCopy:React.PropTypes.func
	}
	,componentDidMount:function () {
		if (typeof window.IRE!=="undefined") {
			require("./ire-hint");
		}
		var textareaNode = ReactDOM.findDOMNode(this.refs.editor);
		this.codeMirror = CM(textareaNode, {
  		value: this.props.value
  		,styleActiveLine:true
  		,undoDepth: Infinity
  		,lineWrapping:true
  		,lineNumbers:this.props.lineNumbers
  		,lineNumberFormatter:this.props.lineNumberFormatter
  		,readOnly:!!this.props.readOnly
  		,theme:this.props.theme||""
  		//,lineNumbers: true
  		//,gutters: ["CodeMirror-linenumbers"]
  		//,lineSeparator:this.props.lineSeparator||null  		
  		,extraKeys: {
  			"Ctrl-I": function(cm){
  				cm.showHint({hint: CM.hint.ire});
  			}
  		}
		});

		//CM.fromTextArea(textareaNode, this.props.options);
		this.props.onBeforeCopy&& this.codeMirror.on('beforeCopyToClipboard', this.props.onBeforeCopy);
		this.props.onChange && this.codeMirror.getDoc().on('change', this.props.onChange);
		this.props.onBeforeChange&& this.codeMirror.on('beforeChange', this.props.onBeforeChange);
		//this.codeMirror.on('focus', this.focusChanged.bind(this, true));
		//this.codeMirror.on('blur', this.focusChanged.bind(this, false));
		this.props.onCursorActivity&&this.codeMirror.on('cursorActivity',this.props.onCursorActivity);
		this.props.onMouseDown&&this.codeMirror.on('mousedown',this.props.onMouseDown);
		this.props.onViewportChange&&this.codeMirror.on('viewportChange',this.props.onViewportChange);

		this.props.onCopy&&this.codeMirror.on('copy',this.props.onCopy);
		this.props.onCut && this.codeMirror.on('cut',this.props.onCut);
		this.props.onPaste && this.codeMirror.on('paste',this.props.onPaste);


		this.props.onKeyUp && this.codeMirror.on('keyup',this.props.onKeyUp);
		this.props.onKeyDown && this.codeMirror.on('keydown',this.props.onKeyDown);
		this.props.onKeyPress&& this.codeMirror.on('keypress',this.props.onKeyPress);

		/*
		setTimeout(function(){
			//this.props.markups&&applyMarkups(this.codeMirror,this.props.markups,true);
			//this.props.onMarkupReady&&this.props.onMarkupReady(this.codeMirror);
		}.bind(this),30);//need to wait for this.codeMirror.react ready (dirty hack)
		*/
	}

	,componentWillUnmount:function () {
		// todo: is there a lighter-weight way to remove the cm instance?
		if (this.codeMirror&& this.codeMirror.toTextArea) {
			this.codeMirror.toTextArea();
		}
		clearTimeout(this.timermove);
	}

	,shouldComponentUpdate:function(nextProps) {
		var update= (nextProps.value!==this.props.value || nextProps.history!==this.props.history 
				||nextProps.markups!==this.props.markups);

		if (nextProps.value!==this.props.value) {
			this.codeMirror.getDoc().setValue(nextProps.value);
		}
		return update;
	}
	,componentWillReceiveProps:function (nextProps) {
		if (this.codeMirror) {
			if (this.props.history !== nextProps.history) {
				//this.codeMirror.setHistory(nextProps.history);
			}
			if (this.props.markups !== nextProps.markups) {
				nextProps.markups&&applyMarkups(this.codeMirror,nextProps.markups);
			}
		}
	}
	,getCodeMirror:function () {
		return this.codeMirror;
	}
	,onMouseMove:function(e) {
		if (!this.props.onMouseMove)return;
		clearTimeout(this.timermove);
		var ev={};
		eventKeys.forEach(function(k) {ev[k]=e[k]});
		this.timermove=setTimeout(function() {
			this.props.onMouseMove(ev);
		}.bind(this),100);
	}
	,render:function () {
		var obj={ref:"editor"};
		if (this.props.onMouseMove) obj.onMouseMove=this.onMouseMove;
		return E("span",obj);
	}
});

module.exports = CodeMirrorComponent;