var serialization=require("./serialization");
module.exports={
	serialize:serialization.serialize,
	deserialize:serialization.deserialize,
	CodeMirror:require("./codemirror-react")
};