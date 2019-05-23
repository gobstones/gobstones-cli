var Batch = require("./batch");
var reporter = require("./reporter");
var interpreter = require('./interpreter');
var blocklyCompiler = require("./blockly/blocklyCompiler");
var safeRun = require("./safe-run");
var fs = require("fs");
var _ = require("lodash");

module.exports = {
  "ast": function(config) {
    withCode(function(code) {
      console.log(reporter.getAst(code));
    });
  },

  "mulang_ast": function(config) {
    withCode(function(code) {
      console.log(reporter.getMulangAst(code));
    });
  },

  "batch": function(config) {
    var json = getFile(config.options.batch);
    var batch = getBatch(json);
    var code = _.trim(batch.code || "");
    var extraCode = _.trim(batch.extraCode || "");

    withCode(function(extraCode) {
      var teacherActions = interpreter.getActions(extraCode);

      withCode(function(code) {
        var mulangAst = safeRun(function() {
          return JSON.parse(reporter.getMulangAst(code));
        });

        Batch.process(batch.examples, code, extraCode, mulangAst);
      }, code, teacherActions);
    }, extraCode);
  },

  "run": function(config) {
    withCode(function(code) {
      var initialBoard;
      if (!_.isUndefined(config.options.initial_board))
        initialBoard = getFile(config.options.initial_board);

      reporter.report(
        reporter.run(code, initialBoard, config.options.format)
      );
    });
  },

  "version": function() {
    console.log(
      JSON.parse(
        getFile(
          __dirname + "/../node_modules/gobstones-interpreter/package.json"
        )
      ).version
    );
  },

  "help": function(config, options) {
    options.showHelp();
  }
};

var readCode = function(code) {
  if (code != null) return code;

  return config.options.from_stdin
      ? fs.readFileSync("/dev/stdin").toString()
      : getFile(config.argv[0]);
};

var withCode = function(action, code, teacherActions) {
  code = readCode(code);
  var isBlocklyCode = _.startsWith(code, "<xml");
  if (isBlocklyCode) blocklyCompiler.compile(code, action, true, teacherActions);
  else action(code);
};

var getReport = function(code, initialBoard, format) {
  JSON.stringify(
    reporter.run(code, initialBoard, format)
  , null, 2)
};

var getFile = function(fileName) {
  try {
    return require("fs").readFileSync(fileName).toString();
  } catch (err) {
    reporter.report({
      status: "file_not_found",
      result: "The file " + (fileName || "?") + " must exist."
    })
    process.exit(1);
  }
};

var getBatch = function(json) {
  var crash = function(error) {
    reporter.report({
      status: "batch_error",
      result: error
    });
    process.exit(1);
  };

  var batch;
  try {
    batch = JSON.parse(json);
  } catch (err) {
    crash("The batch file is not a valid json.");
  }

  if (!_.isString(batch.code))
    crash("`code` should be a string.");
  if (batch.extraCode != null && !_.isString(batch.extraCode))
    crash("`extraCode` should be a string.");
  if (!_.isArray(batch.examples))
    crash("`examples` should be an array.");

  var examplesAreValid = _.every(batch.examples, function(it) {
    var hasInitialBoard = _.isNull(it.initialBoard) || _.isString(it.initialBoard);
    var hasOptionalExtraBoard = it.extraBoard == null || _.isString(it.extraBoard);
    var hasOptionalGeneratedCode = it.generatedCode == null || _.isString(it.generatedCode);

    return hasInitialBoard && hasOptionalExtraBoard && hasOptionalGeneratedCode;
  });
  if (!examplesAreValid)
    crash("Some requests of the batch are invalid.");

  return batch;
};
