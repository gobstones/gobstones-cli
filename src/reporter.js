var gsWeblangCore = require("gs-weblang-core/umd/index.umd");
var mulang = require('./mulang');
var Context = gsWeblangCore.Context;
var parser = require('./parser')
var astReplacer = require("./ast-replacer");
var _ = require("lodash");
var reporter = {}

function getJsonAstUsing(stringifier) {
  return function(code) {
    return stringifier(parser.parseAll(code));
  }
};

reporter.getAst = getJsonAstUsing((nodes) => JSON.stringify(nodes, astReplacer, 2));
reporter.getMulangAst = getJsonAstUsing((nodes) => JSON.stringify(mulang.parse(nodes)));

reporter.run = function(code, initialBoard, format) {
  var ast = parser.parseProgram(code);
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
      result: parser.buildError(err)
    };
  }
};

reporter.getBoardFromGbb = function(gbb, format) {
  var board = this._readGbb(gbb);
  return this._buildBoard(board, format);
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

module.exports = reporter
