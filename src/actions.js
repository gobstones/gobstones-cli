var reporter = require("./reporter");
var blocklyCompiler = require("./blockly/blocklyCompiler");
var safeRun = require("./safe-run");
var async = require("async");
var fs = require("fs");
var _ = require("lodash");

var DEFAULT_GBB = "GBB/1.0\nsize 4 4\nhead 0 0";

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

    async.map(batch, function(it, callback) {
      var format = "all";

      withCode(function(code) {
        withCode(function(extraCode) {
          var finalCode = code + "\n" + extraCode;

          var initialBoard = safeRun(function() {
            return reporter.getBoardFromGbb(it.initialBoard || DEFAULT_GBB, format);
          }, abort);

          var extraBoard = !_.isUndefined(it.extraBoard)
            ? safeRun(function() {
              return reporter.getBoardFromGbb(it.extraBoard, format);
            }, abort) : undefined;

          var mulangAst = safeRun(function() {
            return JSON.parse(reporter.getMulangAst(it.originalCode || code));
          });

          safeRun(function() {
            var report = reporter.run(finalCode, it.initialBoard, format);
            return callback(null, makeBatchReport(report, initialBoard, extraBoard, mulangAst));
          }, function(error) {
            callback(null, makeBatchReport(error, initialBoard, extraBoard, mulangAst, "finalBoardError"));
          });
        }, it.extraCode || "");
      }, it.code);
    }, function(err, results) {
      report(err ? makeError(err) : results);
    });
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

var withCode = function(action, code) {
  var finalCode = code || (
    config.options.from_stdin
      ? fs.readFileSync("/dev/stdin").toString()
      : getFile(config.argv[0]
    )
  );

  var isBlocklyCode = _.startsWith(finalCode, "<xml");
  if (isBlocklyCode) blocklyCompiler.compile(finalCode, action);
  else action(finalCode);
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
  var batch;
  try {
    batch = JSON.parse(json);
  } catch (err) {
    console.log("The batch file is not a valid json.");
    process.exit(1);
  }

  var requestsAreValid = _.every(batch, function(it) {
    return (_.isNull(it.initialBoard) || _.isString(it.initialBoard)) && _.isString(it.code) && (_.isUndefined(it.extraBoard) || _.isString(it.extraBoard));
  });

  if (!requestsAreValid) {
    console.log("Some requests of the batch are invalid. The format is: { initialBoard, [extraBoard], code }.");
    process.exit(1);
  }

  return batch;
};

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
