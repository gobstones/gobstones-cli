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
        head: { x: 0, y: 0 },
        width: 4,
        height: 4,
        table: 'GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n'
      });
    });

    it("should include the snapshots", function() {
      var output = exec("program { Mover(Norte) ; Mover(Este) ; Mover(Norte) }");
      output.result.snapshots[0].board.head.should.eql({ x: 0, y: 0 });
      output.result.snapshots[1].board.head.should.eql({ x: 0, y: 1 });
      output.result.snapshots[2].board.head.should.eql({ x: 1, y: 1 });
      output.result.snapshots[3].board.head.should.eql({ x: 1, y: 2 });
    });

    it("should inform the exit status of a program", function() {
      var output = exec("program {\nreturn(8)\n}");
      output.result.returnValue.should.eql({
        type: "Number",
        value: 8
      });
    });

    it("should return an array board if the format is not specified", function() {
      var output = exec("program {\nPoner(Rojo)\n}");
      _.isArray(output.result.table).should.be.ok;
    });

    it("should respect the initial board if it is specified", function() {
      var output = exec("program {\nMover(Norte)\n}", "--initial_board=" + __dirname + "/fixture/initialBoard.gbb");
      output.result.should.containDeepOrdered({
        head: { x: 0, y: 1 },
        width: 2,
        height: 2,
        table:[
          [ { blue: 1  }, { black: 1 } ],
          [ { red: 1 }, { green: 1 } ]
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
          "message": "Se esperaba una definición (de programa, función, procedimiento, o tipo).\nSe encontró: un identificador con minúsculas.",
          "reason": {
            "code": "expected-but-found",
            "detail": [
              "una definición (de programa, función, procedimiento, o tipo)",
              "un identificador con minúsculas"
            ]
          },
          "on": {
            "range": {
              "start": {
                "row": 1,
                "column": 1
              },
              "end": {
                "row": 1,
                "column": 11
              }
            },
            "region": ""
          }
        }
      });
    });

    it("should return a no_program_found error if the program wasn't found", function() {
      var output = exec("procedure Hola() { }");
      output.should.containDeepOrdered({
        "status": "no_program_found"
      });
    });

    describe("runtime errors", function() {

      var runtimeError = {
        "status": "compilation_error",
        "result": {
          "message": "El procedimiento \"Ponerrrrr\" no está definido.",
          "reason": {
            "code": "undefined-procedure",
            "detail": [
              "Ponerrrrr"
            ]
          },
          "on": {
            "range": {
              "start": {
                "row": 1,
                "column": 10
              },
              "end": {
                "row": 1,
                "column": 24
              }
            },
            "region": ""
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
      var output = exec("program { }", "--initial_board=" + __dirname + "/fixture/wrongBoard.gbb");
      output.should.containDeepOrdered({
        "status": "all_is_broken_error",
        "message": "Something has gone very wrong",
        "detail": {},
        "moreDetail": "GBB/1.0: Malformed board: unknown command \"Negra\"."
      });
    });

  });

  describe("AST generation", function() {
    var program = "program {\n Poner(Azul)\n }";
    var ast = {
      "tag": "N_Main",
      "contents": [
        {
          "tag": "N_DefProgram",
          "contents": [
            {
              "tag": "N_StmtBlock",
              "contents": [
                {
                  "tag": "N_StmtProcedureCall",
                  "contents": [
                    "UPPERID(\"Poner\")",
                    [
                      {
                        "tag": "N_ExprStructure",
                        "contents": [
                          "UPPERID(\"Azul\")",
                          []
                        ]
                      }
                    ]
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    var mulangAst = {
      tag: "EntryPoint",
      contents: [
        "program",
        {
          tag: "Application",
          contents: [
            {
              tag: "Reference",
              contents: "Poner"
            },
            [{ tag: "MuSymbol", contents: "Azul" }]
          ]
        }],
    };

    it("can generate the AST of a program", function() {
      var output = exec(program, "--ast");
      output.should.eql(ast);
    });

    it("can generate the AST of a program, in mulang", function() {
      var output = exec(program, "--mulang_ast");
      output.should.eql(mulangAst);
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
              "head": {
                "x": 0,
                "y": 0
              },
              "width": 2,
              "height": 2,
              "table": {
                "gbb": "GBB/1.0\nsize 2 2\ncell 0 0 Rojo 1\nhead 0 0\n",
                "json": [
                  [
                    {},
                    {}
                  ],
                  [
                    {
                      "red": 1
                    },
                    {}
                  ]
                ]
              }
            },
            "extraBoard": {
              "head": {
                "x": 0,
                "y": 0
              },
              "width": 1,
              "height": 1,
              "table": {
                "gbb": "GBB/1.0\nsize 1 1\nhead 0 0\n",
                "json": [
                  [
                    {}
                  ]
                ]
              }
            },
            "mulangAst": {
              "tag": "EntryPoint",
              "contents": [
                "program",
                {
                  "tag": "Application",
                  "contents": [
                    {
                      "tag": "Reference",
                      "contents": "Mover"
                    },
                    [
                      {
                        "tag": "MuSymbol",
                        "contents": "Norte"
                      }
                    ]
                  ]
                }
              ]
            },
            "finalBoard": {
              "head": {
                "x": 0,
                "y": 1
              },
              "width": 2,
              "height": 2,
              "table": {
                "gbb": "GBB/1.0\nsize 2 2\ncell 0 0 Rojo 1\nhead 0 1\n",
                "json": [
                  [
                    {},
                    {}
                  ],
                  [
                    {
                      "red": 1
                    },
                    {}
                  ]
                ]
              },
              "snapshots": [
                {
                  "contextNames": [
                    "program"
                  ],
                  "board": {
                    "head": {
                      "x": 0,
                      "y": 0
                    },
                    "width": 2,
                    "height": 2,
                    "table": [
                      [
                        {},
                        {}
                      ],
                      [
                        {
                          "red": 1
                        },
                        {}
                      ]
                    ]
                  },
                  "region": ""
                },
                {
                  "contextNames": [
                    "program"
                  ],
                  "board": {
                    "head": {
                      "x": 0,
                      "y": 1
                    },
                    "width": 2,
                    "height": 2,
                    "table": [
                      [
                        {},
                        {}
                      ],
                      [
                        {
                          "red": 1
                        },
                        {}
                      ]
                    ]
                  },
                  "region": ""
                }
              ],
              "returnValue": null
            }
          }
        },
        {
          "status": "runtime_error",
          "result": {
            "initialBoard": {
              "head": {
                "x": 0,
                "y": 0
              },
              "width": 1,
              "height": 1,
              "table": {
                "gbb": "GBB/1.0\nsize 1 1\ncell 0 0 Rojo 1\nhead 0 0\n",
                "json": [
                  [
                    {
                      "red": 1
                    }
                  ]
                ]
              }
            },
            "mulangAst": {
              "tag": "Procedure",
              "contents": [
                "A",
                [
                  [
                    [],
                    {
                      "tag": "UnguardedBody",
                      "contents": {
                        "tag": "Application",
                        "contents": [
                          {
                            "tag": "Reference",
                            "contents": "Poner"
                          },
                          [
                            {
                              "tag": "MuSymbol",
                              "contents": "Negro"
                            }
                          ]
                        ]
                      }
                    }
                  ]
                ]
              ]
            },
            "finalBoardError": {
              "message": "No se puede mover hacia la dirección Norte: cae afuera del tablero.",
              "reason": {
                "code": "cannot-move-to",
                "detail": [
                  "Norte"
                ]
              },
              "on": {
                "range": {
                  "start": {
                    "row": 2,
                    "column": 2
                  },
                  "end": {
                    "row": 2,
                    "column": 13
                  }
                },
                "region": ""
              },
              "snapshots": [
                {
                  "contextNames": [
                    "program"
                  ],
                  "board": {
                    "head": {
                      "x": 0,
                      "y": 0
                    },
                    "width": 1,
                    "height": 1,
                    "table": [
                      [
                        {
                          "red": 1
                        }
                      ]
                    ]
                  },
                  "region": ""
                }
              ]
            }
          }
        }
      ]);
    });

    it("uses a default GBB if the initial board is null", function() {
      var output = exec("", "--format gbb --batch " + __dirname + "/fixture/batch-without-initial-board.json");

      output[0].status.should.eql("passed");
      output[0].result.initialBoard.table.gbb.should.eql("GBB/1.0\nsize 4 4\nhead 0 0\n");
    });

    it("can accept Blockly's XML as code input", function() {
      var output = exec("", "--format gbb --batch " + __dirname + "/fixture/blocks-batch.json");

      output[0].status.should.eql("passed");
    });

    it("batch works as expected with a correct language", function() {
      var output = exec("", "--format gbb --language es --batch " + __dirname + "/fixture/batch.json");
      output[0].status.should.eql("passed");
    });

    it("batch fails with an incorrect language", function() {
      var output = exec("", "--format gbb --language xd --batch " + __dirname + "/fixture/batch.json");
      output[0].status.should.eql("all_is_broken_error");
    });
  });

});
