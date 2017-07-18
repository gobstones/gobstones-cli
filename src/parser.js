var gsWeblangCore = require("gs-weblang-core/umd/index.umd");

function parse(code) {
  try {
    var parser = gsWeblangCore.getParser();
    return parser.parse(code);
  } catch (err) {
    throw {
      status: "compilation_error",
      result: buildError(err)
    };
  }
};

function buildError(error) {
  if (!error.on || !error.message || !error.reason) throw error;

  error.on = error.on.token || error.on;
  return _.pick(error, "on", "message", "reason");
};

function parseProgram(code) {
  return parse(code).program;
}

function parseAll(code) {
  var ast = parse(code);
  return (ast.program ? [ast.program] : []).concat(ast.declarations);
}

module.exports = {
  parseAll: parseAll,
  parseProgram: parseProgram,
  buildError: buildError
}
