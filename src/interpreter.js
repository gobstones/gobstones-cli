var globalOptions = require("./config").getConfig().options;
var GobstonesInterpreterApi = require("gobstones-interpreter").GobstonesInterpreterAPI;
var interpreter = function() {
  var gobstonesApi = new GobstonesInterpreterApi();
  if (globalOptions.language) {
    gobstonesApi.config.setLanguage(globalOptions.language);
  }
  return gobstonesApi;
};

function parse(code, operation) {
  var result = interpreter()[operation || "parse"](code);

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
  parse: parse,
  parseProgram: parseProgram,
  interpret: interpret,
  readGbb,
  buildGbb
}
