var reporter = require("./reporter");
var interpreter = require('./interpreter');
var blocklyCompiler = require("./blockly/blocklyCompiler");
var safeRun = require("./safe-run");
var async = require("async");
var fs = require("fs");
var _ = require("lodash");

var DEFAULT_GBB = "GBB/1.0\nsize 4 4\nhead 0 0";
var RETROCOMPATIBILITY_ALLOW_RECURSION = "\n/*@LANGUAGE@AllowRecursion@*/";
var RETROCOMPATIBILITY_ULTIMO = "\nfunction ultimo(list) { return (último(list)) }";

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
    var FORMAT = "all";

    var json = getFile(config.options.batch);
    var batch = getBatch(json);
    var extraCode = _.trim(example.extraCode || "");

    // TODO: Seguir, mirando https://github.com/gobstones/gobstones-cli/pull/10/files
    // TODO: Mover async.map acá

    withCode(function(extraCode) {
      var ast = interpreter.parse(extraCode);
      var teacherActions = interpreter.getActions(ast);

      withCode(function(code) {
        var mulangAst = safeRun(function() {
          return JSON.parse(reporter.getMulangAst(originalCode || code));
        });

        var finalCode = buildBatchCode(code, extraCode, config);

        async.map(batch, function(it, callback) {
          var initialBoard = safeRun(function() {
            return reporter.getBoardFromGbb(it.initialBoard || DEFAULT_GBB, FORMAT);
          }, abort);

          var extraBoard = !_.isUndefined(it.extraBoard)
            ? safeRun(function() {
              return reporter.getBoardFromGbb(it.extraBoard, FORMAT);
            }, abort) : undefined;

          safeRun(function() {
            var report = reporter.run(finalCode, it.initialBoard, FORMAT);
            return callback(null, makeBatchReport(report, initialBoard, extraBoard, mulangAst));
          }, function(error) {
            callback(null, makeBatchReport(error, initialBoard, extraBoard, mulangAst, "finalBoardError"));
          });
        }, function(err, results) {
          report(err ? makeError(err) : results);
        })
      }, code, teacherActions);
    }, extraCode);
  },

  "run": function(config) {
    withCode(function(code) {
      var initialBoard;
      if (!_.isUndefined(config.options.initial_board))
        initialBoard = getFile(config.options.initial_board);

      report(
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

var withCode = function(action, code, teacherActions, isExtra) {
  code = readCode(code);
  var isBlocklyCode = _.startsWith(code, "<xml");
  if (isBlocklyCode) blocklyCompiler.compile(code, action, true, teacherActions, isExtra);
  else action(code);
};

var getReport = function(code, initialBoard, format) {
  JSON.stringify(
    reporter.run(code, initialBoard, format)
  , null, 2)
};

var report = function(something) {
  console.log(JSON.stringify(something, null, 2));
};

var getFile = function(fileName) {
  try {
    return require("fs").readFileSync(fileName).toString();
  } catch (err) {
    console.log("The file " + (fileName || "?") + " must exist.");
    process.exit(1);
  }
};

var getBatch = function(json) {
  var crash = function(error) {
    console.log(error);
    process.exit(1);
  };

  var batch;
  try {
    batch = JSON.parse(json);
  } catch (err) {
    crash("The batch file is not a valid json.");
  }

  if (batch.extraCode != null && !_.isString(batch.extraCode))
    crash("`extraCode` should be a string.");

  if (!_.isArray(batch.requests))
    crash("`requests` should be an array.");

  var requestsAreValid = _.every(batch.requests, function(it) {
    var hasCode = _.isString(it.code);
    var hasOptionalOriginalCode = it.originalCode == null || _.isString(it.originalCode);
    var hasExamples = _.isArray(it.examples);

    return hasCode && hasOptionalOriginalCode && hasExamples && _.every(it.examples, function(it) {
      const hasInitialBoard = _.isNull(it.initialBoard) || _.isString(it.initialBoard);
      const hasOptionalExtraBoard = it.extraBoard == null || _.isString(it.extraBoard);

      return hasInitialBoard && hasOptionalExtraBoard;
    });
  });

  if (!requestsAreValid)
    crash("Some requests of the batch are invalid.");

  return batch;
};

var buildBatchCode = function(code, extraCode, config) {
  var finalCode = code + "\n" + extraCode + RETROCOMPATIBILITY_ALLOW_RECURSION;

  if (!config.options.language || config.options.language === "es")
    finalCode += RETROCOMPATIBILITY_ULTIMO;

  return finalCode;
}

var makeBatchReport = function(report, initialBoard, extraBoard, mulangAst, finalBoardKey) {
  var result = {
    initialBoard: initialBoard,
    extraBoard: extraBoard,
    mulangAst: mulangAst
  };
  result[finalBoardKey || "finalBoard"] = report.result;
  report.result = result;

  return report;
}

var abort = function(error) {
  report(error);
  process.exit();
};
