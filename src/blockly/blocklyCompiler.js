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
  compile: function(xmlText, action, withRegions = true, teacherActions = null) {
    var self = this;

    loadBlockly(function() {
      var xml = Blockly.Xml.textToDom(xmlText);

      if (teacherActions) {
        teacherActions.primitiveProcedures.forEach(function(it) {
          self._definePrimitiveProcedure(it);
        });
        teacherActions.primitiveFunctions.forEach(function(it) {
          self._definePrimitiveFunction(it);
        });
      }

      var workspace = new Blockly.Workspace();
      Blockly.Xml.domToWorkspace(xml, workspace);
      Blockly.GobstonesLanguage.shouldAddRegionPragma = withRegions;
      var code = Blockly.GobstonesLanguage.workspaceToCode(workspace);

      action(code);
    });
  },

  _definePrimitiveProcedure(name) {
    this._definePrimitiveAction(name, false, window.procBlockCodeGenerator);
  },

  _definePrimitiveFunction(name) {
    this._definePrimitiveAction(name, true, window.functionBlockCodeGenerator);
  },

  _definePrimitiveAction(name, withOutput, generator) {
    var parts = this._getPartsByConvention(name);

    Blockly.Blocks[name] = {
      init: function () {
        var argsIndex = 1;
        this.setColour(Blockly.GOBSTONES_COLORS.primitiveCommand);

        for (var i in parts) {
          if (i == (parts.length - 1)) {
            this.appendDummyInput().appendField(parts[i]);
          } else {
            this.appendValueInput("arg" + argsIndex).appendField(parts[i]);
            argsIndex++;
          }
        }
        this.setPreviousStatement(!withOutput);
        this.setNextStatement(!withOutput);
        this.setInputsInline(true);
        if (withOutput) this.setOutput("var");
      }
    };

    var argsList = [];
    for (var i = 1; i < parts.length; i++) {
      argsList.push("arg" + i);
    }

    Blockly.GobstonesLanguage[name] = generator(name, argsList);
  },

  _getPartsByConvention(name) {
    var parts = name.replace(/([A-Z])/g, " $1").toLowerCase();
    parts = parts[1].toUpperCase() + parts.substring(2);
    parts = this._getParts(parts);
    return parts;
  },

  _getParts(name) {
    return name.split("_");
  }
};
