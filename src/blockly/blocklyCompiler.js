var loadBlockly = function(callback) {
  if (global.Blockly) return callback();

  require("../../vendor/blockly_compressed");
  require("../../vendor/en");

  var jsdom = require("node-jsdom");
  jsdom.env("", [], function(errors, window) {
    global.window = window;
    global.document = window.document;

    require("../../vendor/blocks_compressed");
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
  compile: function(xmlText, action, withRegions = true) {
    loadBlockly(function() {
      var xml = Blockly.Xml.textToDom(xmlText);
      var workspace = new Blockly.Workspace();
      Blockly.Xml.domToWorkspace(xml, workspace);
      Blockly.GobstonesLanguage.shouldAddRegionPragma = withRegions;
      var code = Blockly.GobstonesLanguage.workspaceToCode(workspace);

      action(code);
    });
  }
};
