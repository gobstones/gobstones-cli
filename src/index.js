var getopt = require("node-getopt");
var actions = require("./actions");

var options = getopt.create([
  ["n", "from_stdin", "Take the code from stdin."],
  ["i", "initial_board=BOARD", "Initial board to use. Default: Empty 9x9."],
  ["b", "batch=BATCH", "File with array of { initialBoard, code } to process."],
  ["a", "ast", "Print the AST of the program"],
  ["f", "format=FORMAT", "Format of the final board (gbb or array). Default: array."],
  ["v", "version", "Display the version."],
  ["h", "help", "Display this help."]
]);

options.setHelp(
  "Examples of usage:\n" +
  "gs-weblang-cli file.gbs\n" +
  "gs-weblang-cli --initial_board board.gbb\n" +
  "gs-weblang-cli --batch=request.json\n" +
  "gs-weblang-cli --ast --from_stdin\n" +
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

  (((config.argv.length === 0 && !config.options.from_stdin) || config.argv.length > 1)
    ? actions.help
    : actions.run
  )(config, options);
}

try {
  callAction();
} catch(err) {
  var error = (err.status) ? err : {
    status: "all_is_broken_error",
    message: "Something has gone very wrong",
    detail: err,
    moreDetail: err.message
  };

  console.log(JSON.stringify(error, null, 2));
  process.exit(1);
}
