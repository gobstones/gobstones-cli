var GobstonesInterpreterApi = require("gobstones-interpreter").GobstonesInterpreterAPI;
var interpreter = function() { return new GobstonesInterpreterApi(); };

function parse(code, operation = "parse") {
  var result = interpreter()[operation](code);

  if (result.reason)
    throw {
      status: "compilation_error",
      result: result
    };

  return result;
};

function interpret(program, board) {
  var result = program.interpret(board);

  if (result.reason)
    throw {
      status: "runtime_error",
      result: result
    };

  return result;
}

function getAst(code) {
  return parse(code, "getAst");
}

function parseProgram(code) {
  return parse(code).program;
}

function readGbb(gbb) {
  return interpreter().gbb.read(gbb);
}

function buildGbb(board) {
  return interpreter().gbb.write(board);
}

module.exports = {
  getAst: getAst,
  parseProgram: parseProgram,
  interpret: interpret,
  readGbb,
  buildGbb
}
