var reporter = require("./reporter");
var _ = require("lodash");

module.exports = {
  "batch": function(config) {
    var json = getFile(config.options.batch);
    var batch = getBatch(json);

    report(
      batch.map(function(it) {
        return reporter.run(it.code, it.initialBoard, config.options.format)
      })
    );
  },

  "run": function(config) {
    var code = getFile(config.argv[0]);
    var initialBoard;
    if (config.options.initial_board !== undefined)
      initialBoard = getFile(config.options.initial_board);

    report(
      reporter.run(code, initialBoard, config.options.format)
    );
  },

  "version": function() {
    console.log(
      JSON.parse(
        getFile(
          __dirname + "/../node_modules/gs-weblang-core/package.json"
        )
      ).version
    );
  },

  "help": function(config, options) {
    options.showHelp();
  }
};

var getReport = function(code, initialBoard, format) {
  JSON.stringify(
    reporter.run(code, initialBoard, format)
  , null, 2)
};

var report = function(something) {
  console.log(JSON.stringify(something, null, 2));
};

var getFile = function(fileName) {
  try {
    return require("fs").readFileSync(fileName).toString();
  } catch (err) {
    console.log("The file " + fileName + " must exist.");
    process.exit(1);
  }
};

var getBatch = function(json) {
  var batch;
  try {
    batch = JSON.parse(json);
  } catch (err) {
    console.log("The batch file is not a valid json.");
    process.exit(1);
  }

  var requestsAreValid = _.every(batch, function(it) {
    return _.isString(it.initialBoard) && _.isString(it.code);
  });

  if (!requestsAreValid) {
    console.log("Some requests of the batch are invalid. The format is: { initialBoard, code }.");
    process.exit(1);
  }

  return batch;
};
