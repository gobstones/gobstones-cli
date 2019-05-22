var globalOptions = require("./config").getConfig().options;
var GobstonesInterpreterApi = require("gobstones-interpreter").GobstonesInterpreterAPI;
var _ = require("lodash");

var interpreter = function() {
  var gobstonesApi = new GobstonesInterpreterApi();
  var timeout = parseInt(globalOptions.timeout);

  if (_.isFinite(timeout))
    gobstonesApi.config.setInfiniteLoopTimeout(timeout);

  if (globalOptions.language)
    gobstonesApi.config.setLanguage(globalOptions.language);

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

  if (result.reason) {
    if (result.reason.code === "timeout") {
      result.on.regionStack = [];
      result.snapshots = [];
    }

    throw {
      status: "runtime_error",
      result: result
    };
  }

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
