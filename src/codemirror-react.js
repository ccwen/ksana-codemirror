var CM = require('codemirror');
//require('codemirror/addon/selection/active-line');
var React = require('react');
var E=React.createElement;

var applyMarkups=require("./markups").applyMarkups;

var randomKey=function() {
	return 'm'+Math.random().toString().substr(2,5);
}
var CodeMirror = React.createClass({
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

	,getInitialState:function () {
		return {
			isFocused: false
		};
	},
	cursorActivity:function(cm) { 
		this.props.onCursorActivity&&this.props.onCursorActivity(cm);
	}
	,componentDidMount:function () {
		var textareaNode = React.findDOMNode(this.refs.editor);

		this.codeMirror = CM(textareaNode, {
  		value: this.props.value,
  		mode:  "javascript",
  		inputStyle:"contenteditable",
  		styleActiveLine:true,
  		lineNumbers: true,
  		undoDepth: Infinity,
  		lineWrapping:true,
  		gutters: ["CodeMirror-linenumbers"]
  		,lineNumberFormatter:function(line) {
  			return line;
  		}
		});

		//CM.fromTextArea(textareaNode, this.props.options);
		if (this.props.onBeforeCopy) this.codeMirror.on('beforeCopyToClipboard', this.props.onBeforeCopy);
		this.codeMirror.on('change', this.codemirrorValueChanged);
		if (this.props.onBeforeChange) this.codeMirror.on('beforeChange', this.props.onBeforeChange);
		this.codeMirror.on('focus', this.focusChanged.bind(this, true));
		this.codeMirror.on('blur', this.focusChanged.bind(this, false));
		this.codeMirror.on('cursorActivity',this.cursorActivity);
		this._currentCodemirrorValue = this.props.value;
	},

	componentWillUnmount:function () {
		// todo: is there a lighter-weight way to remove the cm instance?
		if (this.codeMirror) {
			this.codeMirror.toTextArea();
		}
	},

	componentWillReceiveProps:function (nextProps) {
		if (this.codeMirror) {
			if (this._currentCodemirrorValue !== nextProps.value) {
				this.codeMirror.setValue(nextProps.value);
			}

			if (this.props.history !== nextProps.history) {
				console.log("history changed")
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

	codemirrorValueChanged:function (doc, change) {
		var newValue = doc.getValue();
		this._currentCodemirrorValue = newValue;
		this.props.onChange && this.props.onChange(newValue);
	},

	render:function () {
		return E("span",{ref:"editor"});
	}

});

module.exports = CodeMirror;