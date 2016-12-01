var reporter = require("./reporter");

module.exports = {
  "run": function(config) {
    var code = getFile(config.argv[0]);
    var initialBoard;
    if (config.options.initial_board !== undefined)
      initialBoard = getFile(config.options.initial_board);

    console.log(
      JSON.stringify(
        reporter.run(code, initialBoard, config.options.format || "array")
      , null, 2)
    );
  },

  "version": function() {
    console.log(
      JSON.parse(
        getFile(
          __dirname + "../node_modules/gs-weblang-core/package.json"
        )
      ).version
    );
  },

  "help": function(config, options) {
    options.showHelp();
  }
};

var getFile = function(fileName) {
  try {
    return require("fs").readFileSync(fileName).toString();
  } catch (err) {
    console.log("The file " + fileName + " must exist.");
    process.exit(1);
  }
}
