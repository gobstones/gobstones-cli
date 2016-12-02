var gsWeblangCore = require("gs-weblang-core/umd/index.umd");
var Context = gsWeblangCore.Context;
var parser = gsWeblangCore.getParser();
var astReplacer = require("./ast-replacer");
var _ = require("lodash");
var reporter = {}

reporter.getAst = function(code) {
  var ast = this._compile(code);
  return JSON.stringify(ast, astReplacer, 2);
};

reporter.run = function(code, initialBoard, format) {
  var ast = this._compile(code);
  var context = this._createContext(initialBoard);

  try {
    var board = ast.interpret(context).board();
    this._formatBoard(board, format);

    return {
      status: "passed",
      result: board
    }
  } catch (err) {
    throw {
      status: "runtime_error",
      result: this._buildRuntimeError(err)
    };
  }
};

reporter._compile = function(code) {
  try {
    return parser.parseProgram(code)[0];
  } catch (err) {
    throw {
      status: "compilation_error",
      result: this._buildCompilationError(err)
    };
  }
};

reporter._createContext = function(initialBoard) {
  var context = new Context();

  if (initialBoard !== undefined) {
    var board = gsWeblangCore.gbb.reader.fromString(initialBoard);
    _.assign(context.board(), board);
  }

  return context;
};

reporter._formatBoard = function(board, format) {
  board.table = format === "gbb"
    ? gsWeblangCore.gbb.builder.build(board)
    : board.toView();
};

reporter._buildCompilationError = function(error) {
  if (!error.on || !error.error) throw error;

  return {
    on: error.on,
    message: error.error
  }
};

reporter._buildRuntimeError = function(error) {
  if (!error.on || !error.message) throw error;

  error.on = error.on.token;
  return _.pick(error, "on", "message");
};

module.exports = reporter
