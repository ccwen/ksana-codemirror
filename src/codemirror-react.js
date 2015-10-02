var CM = require('codemirror');
require('codemirror/addon/display/panel');
require('codemirror/addon/search/search.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/dialog/dialog.js');

require('codemirror/addon/search/automarkup.js');

//require('codemirror/addon/selection/active-line');
var React = require('react');
var E=React.createElement;

var applyMarkups=require("./markups").applyMarkups;

var randomKey=function() {
	return 'm'+Math.random().toString().substr(2,5);
}
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
	,milestones:{}
	,getInitialState:function () {
		return {
			isFocused: false
		};
	}
	,cursorActivity:function(cm) { 
		this.props.onCursorActivity&&this.props.onCursorActivity(cm);
	}
	,componentDidMount:function () {
		var textareaNode = React.findDOMNode(this.refs.editor);
		var lineNumberFormatter=this.props.lineNumberFormatter||function(line){return line};
		this.codeMirror = CM(textareaNode, {
  		value: this.props.value
  		//,mode:  "javascript"
  		//inputStyle:"contenteditable",
  		,styleActiveLine:true
  		,undoDepth: Infinity
  		,lineWrapping:true
  		
  		,lineNumbers: true
  		,gutters: ["CodeMirror-linenumbers"]
  		,lineNumberFormatter:lineNumberFormatter

		});

		//CM.fromTextArea(textareaNode, this.props.options);
		if (this.props.onBeforeCopy) this.codeMirror.on('beforeCopyToClipboard', this.props.onBeforeCopy);
		this.codeMirror.getDoc().on('change', this.props.onChange);
		if (this.props.onBeforeChange) this.codeMirror.on('beforeChange', this.props.onBeforeChange);
		this.codeMirror.on('focus', this.focusChanged.bind(this, true));
		this.codeMirror.on('blur', this.focusChanged.bind(this, false));
		this.codeMirror.on('cursorActivity',this.cursorActivity);

		setTimeout(function(){
			this.props.markups&&applyMarkups(this.codeMirror,this.props.markups,true);
			this.props.onMarkupReady&&this.props.onMarkupReady(this.codeMirror);
		}.bind(this),30);//need to wait for this.codeMirror.react ready (dirty hack)
	},

	componentWillUnmount:function () {
		// todo: is there a lighter-weight way to remove the cm instance?
		if (this.codeMirror&& this.codeMirror.toTextArea) {
			this.codeMirror.toTextArea();
		}
	},

	shouldComponentUpdate:function(nextProps) {
		var update= (nextProps.value!==this.props.value || nextProps.history!==this.props.history 
				||nextProps.markups!==this.props.markups);
		return update;
	},

	componentWillReceiveProps:function (nextProps) {
		if (this.codeMirror) {

			if (this.props.history !== nextProps.history) {
				//this.codeMirror.setHistory(nextProps.history);
			}

			if (this.props.markups !== nextProps.markups) {
				nextProps.markups&&applyMarkups(this.codeMirror,nextProps.markups);
			}
		}
	},

	getCodeMirror:function () {
		return this.codeMirror;
	},

	markText:function(opts) {
		var doc=this.codeMirror.getDoc();
		var selections=doc.listSelections();
		
		for (var i=0;i<selections.length;i++) {
			var sel=selections[i];
			if (sel.anchor===sel.head) continue; //empty
			if (typeof opts.key!=="string") {
				opts.key=randomKey();
			}
			this.codeMirror.markText(sel.anchor,sel.head, opts );	
		}
	},

	focus:function () {
		if (this.codeMirror) {
			this.codeMirror.focus();
		}
	},

	focusChanged:function (focused) {
		this.setState({isFocused: focused});
		this.props.onFocusChange && this.props.onFocusChange(focused);
	},

	render:function () {
		return E("span",{ref:"editor"});
	}

});

module.exports = CodeMirrorComponent;