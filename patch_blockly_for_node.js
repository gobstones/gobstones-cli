var fs = require("fs");
var _ = require("lodash");

var blocklyFile = "blockly_compressed.js";
var blocklyCode = fs.readFileSync(blocklyFile).toString();
var initialPatch = "global.DOMParser = require('xmlshim').DOMParser; global.XMLSerializer = require('xmlshim').XMLSerializer;"; // adding XML polyfills
var finalPatch = "global.goog = goog; global.Blockly = Blockly;"; // making "goog" and "Blockly" globals
if (!_.startsWith(blocklyCode, initialPatch)) {
  var patchedBlocklyCode = (initialPatch + "\n" + blocklyCode + "\n" + finalPatch)
    .replace( // replacing all the uses of children[...] with childNodes since jsdom doesn't support it
      "Blockly.Xml.domToVariables=function(a,b){for",
      "Blockly.Xml.domToVariables=function(a,b){a.children=a.childNodes;for"
    );
  fs.writeFileSync(blocklyFile, patchedBlocklyCode);
}
