var fs = require("fs");
var exec = require('child_process').execSync;

module.exports = function(program, arguments, fromStdin) {
  if (!arguments) arguments = "";

  fs.writeFileSync("/tmp/gobs.gbs", program);
  var output;
  try {
    output = exec(getCommand(program, arguments, fromStdin)).toString();
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

var getCommand = function(program, arguments, fromStdin) {
  var path = "/../bin/gs-weblang-cli";

  return fromStdin
    ? 'echo "' + program + '" | ' + __dirname + path + " " + arguments
    : __dirname + path + " /tmp/gobs.gbs " + arguments
}
