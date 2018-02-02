var getopt = require("node-getopt");
var safeRun = require("./safe-run");
var globalConfig = require("./config");

var options = getopt.create([
  ["n", "from_stdin", "Take the code from stdin."],
  ["i", "initial_board=BOARD", "Initial board to use. Default: Empty 9x9."],
  ["b", "batch=BATCH", "Process a batch request: an array of { initialBoard, [extraBoard], code }."],
  ["a", "ast", "Print the AST of the program."],
  ["m", "mulang_ast", "Print the Mulang AST of the program."],
  ["f", "format=FORMAT", "Format of the final board table (gbb|json|all). Default: json."],
  ["v", "version", "Display the version."],
  ["h", "help", "Display this help."],
  ["l", "language=LANGUAGE", "The language code. Default: es"]
]);

options.setHelp(
  "Examples of usage:\n" +
  "gobstones-cli file.gbs\n" +
  "gobstones-cli --initial_board board.gbb\n" +
  "gobstones-cli --batch request.json\n" +
  "gobstones-cli --ast --from_stdin\n" +
  "gobstones-cli --mulang_ast --from_stdin\n" +
  "\n" + "[[OPTIONS]]"
);

config = options.parseSystem();

globalConfig.setConfig(config);

var actions = require("./actions");

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

safeRun(callAction, function(error) {
  console.log(JSON.stringify(error, null, 2));
  process.exit(1);
});
