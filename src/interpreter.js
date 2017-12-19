var GobstonesInterpreterApi = require("gobstones-interpreter").GobstonesInterpreterAPI;
var interpreter = () => new GobstonesInterpreterApi();

function parse(code) {
  var result = interpreter().parse(code);

  if (result.reason)
    throw {
      status: "compilation_error",
      result: result
    };

  return result;
};

function interpret(program, board) {
  const result = program.interpret(board);

  if (result.reason)
    throw {
      status: "runtime_error",
      result: result
    };

  return result;
}

function parseProgram(code) {
  return parse(code).program;
}

function parseAll(code) {
  var result = parse(code);
  return (result.program ? [result.program] : []).concat(result.declarations);
}

function readGbb(gbb) {
  return interpreter().gbb.read(gbb);
}

function buildGbb(board) {
  return interpreter().gbb.write(board);
}

module.exports = {
  parseAll: parseAll,
  parseProgram: parseProgram,
  interpret: interpret,
  readGbb,
  buildGbb
}
