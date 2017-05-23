should = require("should");
var fs = require("fs");
var exec = require("./exec");
var _ = require("lodash");

describe("run", function() {

  describe("good programs", function() {

    it("should return a gbb board if the format is gbb", function() {
      var output = exec("program {\nPoner(Rojo)\n}", "--format gbb");
      output.status.should.equal("passed");
      output.result.should.containDeepOrdered({
        x: 0,
        y: 0,
        sizeX: 9,
        sizeY: 9,
        table: 'GBB/1.0\r\nsize 9 9\r\ncell 0 0 Azul 0 Negro 0 Rojo 1 Verde 0\r\nhead 0 0\r\n'
      });
    });

    it("should inform the exit status of a program", function() {
      var output = exec("program {\nreturn(8)\n}");
      output.result.exitStatus.should.equal(8);
    });

    it("should return an array board if the format is not specified", function() {
      var output = exec("program {\nPoner(Rojo)\n}");
      _.isArray(output.result.table).should.be.ok;
    });

    it("should respect the initial board if it is specified", function() {
      var output = exec("program {\nMover(Norte)\n}", "--initial_board=" + __dirname + "/fixture/initialBoard.gbb");
      output.result.should.containDeepOrdered({
        x: 0,
        y: 1,
        sizeX: 2,
        sizeY: 2,
        table:[
          [ { blue: 1, red: 0, black: 0, green: 0 }, { blue: 0, red: 0, black: 1, green: 0 } ],
          [ { blue: 0, red: 1, black: 0, green: 0 }, { blue: 0, red: 0, black: 0, green: 1 } ]
        ]
      });
    });

  });

  describe("bad programs", function() {

    it("should return a compilation error if the program does not compile", function() {
      var output = exec("programita {\nPoner(Rojo)\n}");
      output.should.containDeepOrdered({
        "status": "compilation_error",
        "result": {
          "on": {
            "range": {
              "start": {
                "row": 0,
                "column": 1
              },
              "end": {
                "row": 0,
                "column": 10
              }
            },
            "value": "programita",
            "arity": "name"
          },
          "message": "Se esperaba una definición de programa, función o procedimiento."
        }
      });
    });

    describe("runtime errors", function() {

      var runtimeError = {
        "status": "runtime_error",
        "result": {
          "on": {
            "range": {
              "start": {
                "row": 0,
                "column": 10
              },
              "end": {
                "row": 0,
                "column": 18
              }
            },
            "value": "Ponerrrrr",
            "arity": "name"
          },
          "message": 'El procedimiento "Ponerrrrr" no se encuentra definido.',
          "reason": {
            "code": "undefined_procedure",
            "detail": { name: "Ponerrrrr" }
          }
        }
      };

      it("should return a runtime error if the program does boom", function() {
        var output = exec("program {\Ponerrrrr(Rojo)\n}");
        output.should.eql(runtimeError);
      });

      it("should report the errors well when reading from stdin", function() {
        var output = exec("program {\Ponerrrrr(Rojo)\n}", "--from_stdin", true);
        output.should.eql(runtimeError);
      });

    });

    it("should catch unexpected errors", function() {
      var output = exec("");
      output.should.containDeepOrdered({
        "status": "all_is_broken_error",
        "message": "Something has gone very wrong",
        "detail": {},
        "moreDetail": "Cannot read property 'range' of null"
      });
    });

  });

  describe("AST generation", function() {
    var program = "program {\n Poner(Azul)\n }";
    var ast = [{
      "alias": "program",
      "body": [
        {
          "arity": "statement",
          "alias": "Drop",
          "parameters": [
            {
              "value": 0,
              "alias": "Blue"
            }
          ]
        }
      ]
    }];

    it("can generate the AST of a program", function() {
      var output = exec(program, "--ast");
      output.should.eql(ast);
    });

    it("can take the program from stdin", function() {
      var output = exec(program, "--ast --from_stdin", true);
      output.should.eql(ast);
    });

  });

  describe("Batch execution", function() {
    it("returns a report with the result of each execution", function() {
      var output = exec("", "--format gbb --batch " + __dirname + "/fixture/batch.json");
      output.should.containDeepOrdered([
        {
          "status": "passed",
          "result": {
            "initialBoard": {
              "x": 0,
              "y": 0,
              "sizeX": 2,
              "sizeY": 2,
              "table": {
                "gbb": "GBB/1.0\r\nsize 2 2\r\ncell 0 0 Azul 0 Negro 0 Rojo 1 Verde 0\r\nhead 0 0\r\n",
                "json": [
                  [
                    {
                      "blue": 0,
                      "red": 0,
                      "black": 0,
                      "green": 0
                    },
                    {
                      "blue": 0,
                      "red": 0,
                      "black": 0,
                      "green": 0
                    }
                  ],
                  [
                    {
                      "blue": 0,
                      "red": 1,
                      "black": 0,
                      "green": 0
                    },
                    {
                      "blue": 0,
                      "red": 0,
                      "black": 0,
                      "green": 0
                    }
                  ]
                ]
              }
            },
            "finalBoard": {
              "x": 0,
              "y": 1,
              "sizeX": 2,
              "sizeY": 2,
              "table": {
                "gbb": "GBB/1.0\r\nsize 2 2\r\ncell 0 0 Azul 0 Negro 0 Rojo 1 Verde 0\r\nhead 0 1\r\n",
                "json": [
                  [
                    {
                      "blue": 0,
                      "red": 0,
                      "black": 0,
                      "green": 0
                    },
                    {
                      "blue": 0,
                      "red": 0,
                      "black": 0,
                      "green": 0
                    }
                  ],
                  [
                    {
                      "blue": 0,
                      "red": 1,
                      "black": 0,
                      "green": 0
                    },
                    {
                      "blue": 0,
                      "red": 0,
                      "black": 0,
                      "green": 0
                    }
                  ]
                ]
              }
            },
            "extraBoard": {
              "x": 0,
              "y": 0,
              "sizeX": 1,
              "sizeY": 1,
              "table": {
                "gbb": "GBB/1.0\r\nsize 1 1\r\nhead 0 0\r\n",
                "json": [
                  [
                    {
                      "blue": 0,
                      "red": 0,
                      "black": 0,
                      "green": 0
                    }
                  ]
                ]
              }
            }
          }
        },
        {
          "status": "runtime_error",
          "result": {
            "initialBoard": {
              "x": 0,
              "y": 0,
              "sizeX": 1,
              "sizeY": 1,
              "table": {
                "gbb": "GBB/1.0\r\nsize 1 1\r\ncell 0 0 Azul 0 Negro 0 Rojo 1 Verde 0\r\nhead 0 0\r\n",
                "json": [
                  [
                    {
                      "blue": 0,
                      "red": 1,
                      "black": 0,
                      "green": 0
                    }
                  ]
                ]
              }
            },
            "finalBoardError": {
              "on": {
                "arity": "operator",
                "range": {
                  "end": {
                    "column": 7,
                    "row": 1
                  },
                  "start": {
                    "column": 7,
                    "row": 1
                  }
                },
                "value": "("
              },
              "message": "Te caíste del tablero por: x=0 y=0",
              "reason": {
                "code": "out_of_board",
                "detail": { "x": 0, "y": 0 }
              }
            }
          }
        }
      ]);
    });

  });

});
