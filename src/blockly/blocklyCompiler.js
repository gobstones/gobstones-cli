var fs = require("fs");
var _ = require("lodash");

// --- Blockly: ugly monkey-patching ---
var blocklyFile = "node_modules/blockly/blockly_compressed.js";
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
// -------------------------------------

var loadBlockly = function(callback) {
  if (global.Blockly) return callback();

  require("blockly/blockly_compressed");
  require("blockly/msg/js/en");

  var jsdom = require("node-jsdom");
  jsdom.env("", [], function(errors, window) {
    global.window = window;
    global.document = window.document;

    require("blockly/blocks_compressed");
    require("proceds-blockly/proceds-blockly-original");
    require("proceds-blockly/proceds-blockly");
    window.initProcedsBlockly("Statement");
    require("gs-element-blockly/js/errors");
    require("gs-element-blockly/js/gobstones-blocks");
    require("gs-element-blockly/js/gobstones-language-generator");

    callback();
  });
};

module.exports = {
  compile: function(xmlText, action, withPragmaRegion) {
    loadBlockly(function() {
      var xml = Blockly.Xml.textToDom(xmlText);
      var workspace = new Blockly.Workspace();
      Blockly.Xml.domToWorkspace(xml, workspace);
      Blockly.GobstonesLanguage.shouldAddRegionPragma = withPragmaRegion !== false;
      var code = Blockly.GobstonesLanguage.workspaceToCode(workspace);

      action(code);
    });
  }
};
