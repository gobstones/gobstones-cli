var reporter = require("./reporter");
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

    report(
      batch.map(function(it) {
        var format = "all";

        var initialBoard = safeRun(function() {
          return reporter.getBoardFromGbb(it.initialBoard, format);
        }, abort);

        var extraBoard = !_.isUndefined(it.extraBoard)
          ? safeRun(function() {
            return reporter.getBoardFromGbb(it.extraBoard, format);
          }, abort) : undefined;

        var mulangAst = safeRun(function() {
          return JSON.parse(reporter.getMulangAst(it.code));
        });

        return safeRun(function() {
          var report = reporter.run(it.code, it.initialBoard, format);
          return makeBatchReport(report, initialBoard, extraBoard, mulangAst);
        }, function(error) {
          return makeBatchReport(error, initialBoard, extraBoard, mulangAst, "finalBoardError");
        });
      })
    );
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

var withCode = function(action) {
  if (!config.options.from_stdin) {
    action(getFile(config.argv[0]));
    return;
  }

  action(fs.readFileSync("/dev/stdin").toString());
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
    return _.isString(it.initialBoard) && _.isString(it.code) && (_.isUndefined(it.extraBoard) || _.isString(it.extraBoard));
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
