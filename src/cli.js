var getopt = require("node-getopt");
var actions = require("./actions");

var options = getopt.create([
  ["b", "batch=BATCH", "File with array of { initialBoard, code } to process."],
  ["i", "initial_board=BOARD", "Initial board to use. Default: Empty 4x4."],
  ["f", "format=FORMAT", "Format of the final board (gbb or array). Default: array."],
  ["v", "version", "Display the version."],
  ["h", "help", "Display this help."]
]);

options.setHelp(
  "Usages:\n" +
  "gbs file.gbs\n" +
  "gbs file.gbs --format gbb\n" +
  "gbs batch=request.json\n" +
  "gbs --initial_board board.gbb\n" +
  "\n" + "[[OPTIONS]]"
);

config = options.parseSystem();

function callAction() {
  for (option in actions) {
    if (config.options[option] !== undefined) {
      actions[option](config, options);
      return;
    }
  }

  ((config.argv.length === 0 || config.argv.length > 1)
    ? actions.help
    : actions.run
  )(config, options);
}

callAction();
