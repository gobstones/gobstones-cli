var reporter = require("./reporter");
var safeRun = require("./safe-run");
var _ = require("lodash");

module.exports = {
  "ast": function(config) {
    withCode(function(code) {
      console.log(reporter.getAst(code));
    });
  },

  "batch": function(config) {
    var json = getFile(config.options.batch);
    var batch = getBatch(json);

    report(
      batch.map(function(it) {
        return safeRun(function() {
          var format = "all";

          var report = reporter.run(it.code, it.initialBoard, format);
          if (report.status === "passed") {
            report.result = {
              initialBoard: reporter.getBoardFromGbb(it.initialBoard, format),
              finalBoard: report.result
            };

            if (!_.isUndefined(it.extraBoard))
              report.result.extraBoard = reporter.getBoardFromGbb(it.extraBoard, format);
          }

          return report;
        });
      })
    );
  },

  "run": function(config) {
    withCode(function(code) {
      var initialBoard;
      if (!_.isUndefined(config.options.initial_board))
        initialBoard = getFile(config.options.initial_board);

      report(
        reporter.run(code, initialBoard, config.options.format)
      );
    });
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

var withCode = function(action) {
  if (!config.options.from_stdin) {
    action(getFile(config.argv[0]));
    return;
  }

  var code = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("readable", function() {
    var chunk = process.stdin.read();
    if (chunk !== null) code += chunk;
  });
  process.stdin.on("end", function() {
    action(code);
  });
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
    console.log("The file " + (fileName || "?") + " must exist.");
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
    return _.isString(it.initialBoard) && _.isString(it.code) && (_.isUndefined(it.extraBoard) || _.isString(it.extraBoard));
  });

  if (!requestsAreValid) {
    console.log("Some requests of the batch are invalid. The format is: { initialBoard, [extraBoard], code }.");
    process.exit(1);
  }

  return batch;
};
