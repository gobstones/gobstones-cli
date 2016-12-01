var gsWeblangCore = require("gs-weblang-core/umd/index.umd");
var Context = gsWeblangCore.Context;
var parser = gsWeblangCore.getParser();
_ = require("lodash");

var NoProgramsFoundError = function() { }
NoProgramsFoundError.prototype = new Error("No programs found");

var reporter = {}

reporter.run = function(code, initialBoard, format) {
  var ast;
  try {
    ast = parser.parseProgram(code);
    if (ast.length === 0) throw new NoProgramsFoundError();
    ast = ast[0];
  } catch (err) {
    return {
      status: "compilation_error",
      result: this._buildCompilationError(err)
    }
  }

  try {
    var board = ast.interpret(new Context()).board();
    board.table = format == "gbb"
      ? gsWeblangCore.gbb.builder.build(board)
      : board.toView();

    return {
      status: "passed",
      result: board
    }
  } catch (err) {
    return {
      status: "runtime_error",
      result: this._buildRuntimeError(err)
    }
  }
}

reporter._buildCompilationError = function(error) {
  return {
    message: error.error,
    on: error.on
  }
}

reporter._buildRuntimeError = function(error) {
  error.on = error.on.token;
  return _.pick(error, "on", "message");
}

module.exports = reporter
