var mulang = require('./mulang');
var interpreter = require('./interpreter');
var astReplacer = require("./ast-replacer");
var _ = require("lodash");
var reporter = {};

var DEFAULT_GBB = "GBB/1.0\nsize 4 4\nhead 0 0\n";

function getJsonAstUsing(stringifier) {
  return function(code) {
    return stringifier(interpreter.getAst(code));
  }
}

reporter.getAst = getJsonAstUsing((nodes) => JSON.stringify(nodes, astReplacer, 2));
reporter.getMulangAst = getJsonAstUsing((nodes) => JSON.stringify(mulang.parse(nodes)));

reporter.run = function(code, initialGbb, format) {
  var program = interpreter.parseProgram(code);
  if (!program) throw { status: "no_program_found" };
  var gbb = initialGbb || DEFAULT_GBB;
  var board = interpreter.readGbb(gbb);
  var result = interpreter.interpret(program, board);
  var finalBoard = result.finalBoard;

  var executionReport = this._buildBoard(
    finalBoard,
    format
  );
  executionReport.returnValue = result.returnValue;

  return {
    status: "passed",
    result: executionReport
  }
};

reporter.getBoardFromGbb = function(gbb, format) {
  var board = interpreter.readGbb(gbb);
  return this._buildBoard(board, format);
};

reporter.report = function(something) {
  console.log(JSON.stringify(something, null, 2));
};

reporter._buildBoard = function(board, format) {
  board.table = this._getFormattedTable(board, format);
  return board;
};

reporter._getFormattedTable = function(board, format) {
  var gbb = function() { return interpreter.buildGbb(board) };
  var json = function() { return board.table };

  switch (format) {
    case "gbb": return gbb();
    case "all": return { gbb: gbb(), json: json() };
    default: return json();
  }
};

module.exports = reporter;
