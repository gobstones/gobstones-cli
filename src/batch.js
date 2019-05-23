var reporter = require("./reporter");
var safeRun = require("./safe-run");
var async = require("async");
var _ = require("lodash");

var FORMAT = "all";
var RETROCOMPATIBILITY_ALLOW_RECURSION = "\n/*@LANGUAGE@AllowRecursion@*/";
var RETROCOMPATIBILITY_ULTIMO = "\nfunction ultimo(list) { return (último(list)) }";

module.exports = {
  process: function(examples, code, extraCode, mulangAst) {
    async.map(examples, function(example, callback) {
      var finalStudentCode = example.generatedCode || code;
      var finalCode = buildBatchCode(finalStudentCode, extraCode, config);

      var initialBoard = safeRun(function() {
        return reporter.getBoardFromGbb(example.initialBoard || DEFAULT_GBB, FORMAT);
      }, abort);

      var extraBoard = !_.isUndefined(example.extraBoard)
        ? safeRun(function() {
          return reporter.getBoardFromGbb(example.extraBoard, FORMAT);
        }, abort) : undefined;

      safeRun(function() {
        var report = reporter.run(finalCode, example.initialBoard, FORMAT);
        return callback(null, makeBatchReport(report, initialBoard, extraBoard, mulangAst));
      }, function(error) {
        callback(null, makeBatchReport(error, initialBoard, extraBoard, mulangAst, "finalBoardError"));
      });
    }, function(err, results) {
      reporter.report(err ? makeError(err) : results);
    });
  }
}

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
  reporter.report(error);
  process.exit();
};
