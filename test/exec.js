var fs = require("fs");
var exec = require('child_process').execSync;

module.exports = function(program, arguments) {
  if (!arguments) arguments = "";

  fs.writeFileSync("/tmp/gobs.gbs", program);
  var output;
  try {
    output = exec(__dirname + "/../bin/gs-weblang-cli /tmp/gobs.gbs " + arguments).toString();
  } catch(err) {
    var error = err.output.toString();
    output = error.substring(error.indexOf("{"), error.lastIndexOf("}") + 1);
  }

  try {
    return JSON.parse(output);
  } catch (err) {
    var error = new Error("The command did not respond a JSON");
    error.output = output;
    throw error;
  }
}
