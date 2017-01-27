var gsWeblangCore = require("gs-weblang-core/umd/index.umd");
var Context = gsWeblangCore.Context;
var parser = gsWeblangCore.getParser();
var astReplacer = require("./ast-replacer");
var _ = require("lodash");
var reporter = {}

reporter.getAst = function(code) {
  var ast = this._compile(code);
  var nodes = ast.declarations.concat(ast.program || []);
  return JSON.stringify(nodes, astReplacer, 2);
};

reporter.run = function(code, initialBoard, format) {
  var ast = this._compile(code).program;
  var context = this._createContext(initialBoard);

  try {
    var board = this._buildBoard(
      this._interpret(ast, context),
      format
    );

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

reporter.getBoardFromGbb = function(gbb, format) {
  var board = this._readGbb(gbb);
  return this._buildBoard(board, format);
};

reporter._compile = function(code) {
  try {
    return parser.parse(code);
  } catch (err) {
    throw {
      status: "compilation_error",
      result: this._buildCompilationError(err)
    };
  }
};

reporter._interpret = function(ast, context) {
  var newContext = ast.interpret(context);
  var board = newContext.board();
  board.exitStatus = newContext.exitStatus;
  return board;
};

reporter._createContext = function(initialBoard) {
  var context = new Context();

  if (!_.isUndefined(initialBoard)) {
    var board = this._readGbb(initialBoard);
    _.assign(context.board(), board);
  }

  return context;
};

reporter._buildBoard = function(board, format) {
  board.table = this._getFormattedTable(board, format);
  return board;
};

reporter._getFormattedTable = function(board, format) {
  var gbb = function() { return gsWeblangCore.gbb.builder.build(board) };
  var json = function() { return board.toView() };

  switch (format) {
    case "gbb": return gbb();
    case "all": return { gbb: gbb(), json: json() };
    default: return json();
  }
}

reporter._readGbb = function(gbb) {
  return gsWeblangCore.gbb.reader.fromString(gbb);
};

reporter._buildCompilationError = function(error) {
  if (!error.on || !error.error) throw error;

  return {
    on: error.on,
    message: error.error
  }
};

reporter._buildRuntimeError = function(error) {
  if (!error.on || !error.message || !error.reason) throw error;

  error.on = error.on.token || error.on;
  return _.pick(error, "on", "message", "reason");
};

module.exports = reporter
