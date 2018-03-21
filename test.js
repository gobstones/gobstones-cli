var fs = require("fs");
var _ = require("lodash");

// --- Blockly ugly monkey-patching ---
var blocklyFile = "node_modules/blockly/blockly_compressed.js";
var blocklyCode = fs.readFileSync(blocklyFile).toString();
var initialPatch = "if (typeof window === 'undefined') { var DOMParser = require('xmldom').DOMParser; }";
var finalPatch = "if (typeof window === 'undefined') { global.goog = goog; global.Blockly = Blockly; }";
if (!_.startsWith(blocklyCode, initialPatch)) {
  var patchedBlocklyCode = (initialPatch + "\n" + blocklyCode + "\n" + finalPatch)
    .replace(
      "Blockly.Xml.domToVariables=function(a,b){for",
      "Blockly.Xml.domToVariables=function(a,b){a.children=a.childNodes;for"
    );
  fs.writeFileSync(blocklyFile, patchedBlocklyCode);
}
// -------------------------------

require("blockly/blockly_compressed");
require("blockly/msg/js/en");
require("jsdom-global")()
require("blockly/blocks_compressed");
require("gs-element-blockly/js/errors");
require("gs-element-blockly/js/gobstones-blocks");
require("gs-element-blockly/js/gobstones-language-generator");

var xmlText = `<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="Program" id="RHXW1%++T^Ys]YEI!3d." deletable="false" x="30" y="30"><mutation timestamp="1521577454770"></mutation><statement name="program"><block type="Poner" id="RykY[RO_vu)n(L=_7YN7"><value name="COLOR"><block type="ColorSelector" id="*#VI=nTul1AiKoeC:HVP"><field name="ColorDropdown">Rojo</field></block></value><next><block type="Poner" id="LT^N,aeRvX2fU/xCHx!+"><value name="COLOR"><block type="ColorSelector" id="WxMoc3y5gXN1~:#vob:M"><field name="ColorDropdown">Verde</field></block></value><next><block type="Mover" id="hsb[2AC[+xT)2_o|D5V%"><value name="DIRECCION"><block type="DireccionSelector" id="Cg+pGnDM!;uXsH+uz4_#"><field name="DireccionDropdown">Este</field></block></value></block></next></block></next></block></statement></block></xml>`;

var xml = Blockly.Xml.textToDom(xmlText);
var workspace = new Blockly.Workspace();
Blockly.Xml.domToWorkspace(xml, workspace);
var code = Blockly.GobstonesLanguage.workspaceToCode(workspace);
console.log(code);
