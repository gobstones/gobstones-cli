var should = require("should");
var _ = require("lodash");

var Mulang = require("../src/mulang");
var s = Mulang.s;

function program(body) {
  return s("EntryPoint", ["program", body]);
}

const muNull = s("MuNull");
function reference(name) {
  return s("Reference", name);
}

describe("gobstones", function() {
  it("translates programs with returns", function() {
    Mulang.parse("program { result := foo(); return (result) }").should.equal(
      program(s("Sequence", [
        s("Variable",["result", s("Application", [reference("foo"), []])]),
        s("Return", reference("result"))]))
    );
  });

  it("translates simple Gobstones program", function() {
    Mulang.parse("program {}").should.equal(program(muNull));
  });

  it("translates simple procedure Call", function() {
    Mulang.parse("program{F()}").should.equal(program(s("Application", [reference("F"), []])));
  });

  it("translates simple procedure declaration ", function() {
    Mulang.parse("procedure F(){}").should.equal(callable("F", [], muNull));
  });

  it("translates simple procedure declaration and application  with a parameter", function() {
    var code = Mulang.parse("program{F(2)} procedure F(parameter){}");

    code.should.equal(
      s("Sequence", [
        program(s("Application", [reference("F"), [s("MuNumber", 2.0)]])),
        callable("F", s("VariablePattern", "parameter"), muNull)]));
  });

  it("translates simple procedure Application ", function() {
    var code = Mulang.parse("program{F()} procedure F(){}");

    code.should.equal(s("Sequence", [
      program(s("Application", [reference("F"), []])),
      callable( "F", [], muNull)]));
  });

  it("translates Poner", function() {
    var code = Mulang.parse("program{Poner(Verde)}");

    code.should.equal(
      program(s("Application", [reference("Poner"), [s("MuSymbol", "Verde")]])));
  });

  it("translates Sacar", function() {
    var code =  Mulang.parse("program{Sacar(Verde)}");

    code.should.equal(
      program(s("Application", [reference("Sacar"), [s("MuSymbol", "Verde")]])));
  });

  it("translates Mover", function() {
    var code = Mulang.parse("program{Mover(Este)}");

    code.should.equal(
      program(s("Application", [reference("Mover"), [s("MuSymbol", "Este")]])));
  });

  it("translates simple function declaration", function() {
    var code = Mulang.parse("function f(){return (Verde)}");

    code.should.equal(
      callable("f", [], s("Sequence", [
        muNull,
        s("Return", s("MuSymbol", "Verde"))])));
  });

  it("translates simple function declaration", function() {
    var  code = Mulang.parse("function f(parameter){return (2)}");

    code.should.equal(
      callable("f", [s("VariablePattern", "parameter")], s("Sequence", [
        muNull,
        s("Return", s("MuNumber", 2))])));
  });

  it("translates simple variable assignment", function() {
    var code = Mulang.parse("program{x:= 1}");

    code.should.equal(
      program(s("Assignment", ["x", s("MuNumber", 1)])));
  });

  it("translates simple variable assignment", function() {
    var code = Mulang.parse("program{x:= Verde}");

    code.should.equal(program(s("Variable", "x", s("MuSymbol", "Verde"))));
  });

  it("translates simple variable assignment", function() {
    var code = Mulang.parse("program{x:= True}");

    code.should.equal(program(s("Variable", "x", s("MuBool", true))));
  });

  it("translates simple variable assignment", function() {
    var  code = Mulang.parse("program{x:= Este}");

    code.should.equal(program(s("Variable", "x", s("MuSymbol", "Este"))));
  });

  it("translates simple variable assignment", function() {
    var  code = Mulang.parse("program{x:= y}");

    code.should.equal(program(s("Variable", "x", reference("y"))));
  });

  it("translates simple variable assignment", function() {
    var code = Mulang.parse("program{x:= f(2)}");

    code.should.equal(
      program(s("Variable", "x", s("Application", [reference("f"), [s("MuNumber", 2.0)]])))
    );
  });

  it("translates simple variable assignment", function() {
    var code = Mulang.parse("program{x:= z && y}");

    code.should.equal(
      program(s("Variable", "x", s("Application", [reference("&&"), [reference("z"), reference("y")]])))
    );
  });

  it("translates simple variable assignment", function() {
    var code = Mulang.parse("program{x:= not z}");

    code.should.equal(
      program(s("Variable", "x", s("Application", [reference("not"), [reference("z")]])))
    );
  });

  it("translates simple variable assignment", function() {
    var code = Mulang.parse("program{x := True == 2 && x /= t}");

    code.should.equal(
      program(
        s("Variable", "x",
          s("Application", [
            reference("&&"), [
              s("Application", [s("Equal"),    [s("MuBool", true), s("MuNumber", 2.0)]]),
              s("Application", [s("NotEqual"), [reference("x"), reference("t")]])
            ]])))
    );
  });

  it("translates simple procedure declaration and application  with a parameter", function() {
    var code = Mulang.parse("program{F(Negro)} procedure F(parameter){}");

    code.should.equal(
      s("Sequence", [
        program(
          s("Application", [reference("F"), [s("MuSymbol", "Negro")]]),
          callable("F", [s("VariablePattern", "parameter")], muNull))])
    );
  });

  it("translates conditional declaration", function() {
    var code = Mulang.parse("program{if(True){}}");

    code.should.equal(
      program(s("If", [s("MuBool", true), muNull, muNull]))
    );
  });

  it("translates conditional declaration, with branches", function() {
    var code = Mulang.parse("program{if(True){x := 1}}");

    code.should.equal(
      program(s("If", [
        s("MuBool", true),
        s("Variable", ["x", s("MuNumber", 1.0)]),
        muNull]))
    );
  });

  it("translates while declaration", function() {
    var code = Mulang.parse("program{while(True){}}");

    code.should.equal(program(s("While", [s("MuBool", true), muNull])));
  });

  it("translates while declaration", function() {
    var code = Mulang.parse("program{while(True){x := 1}}");

    code.should.equal(
      program(s("While", [
        s("MuBool", true),
        s("Assignment", ["x", s("MuNumber", 1.0)])]))
    );
  });

  it("translates switch declaration", function() {
    var code = Mulang.parse("program{switch(2) to {2 -> {x := 2}}}");

    code.should.equal(
      program(
        s("Switch", [
          s("MuNumber", 2.0),
          [s("MuNumber", 2.0), s("Variable", ["x", s("MuNumber", 2.0)])]]))
    );
  });

  it("translates repeat declaration", function() {
    var code = Mulang.parse("program{repeat(2){x := 2}}");

    code.should.equal(
      program(s("Repeat", [
        s("MuNumber", 2.0),
        s("Variable", ["x", s("MuNumber", 2.0)])]))
    );
  });

  it("translates a complete program", function() {
    var code = Mulang.parse(`
      program {F(Verde) G(2,3) X(Este) y := f(False) }
      procedure F(x){ Poner(x) Poner(x) Poner(x) Sacar(x) }
      procedure G(n1,n2){ x := n1 z := n2 while(True){ x := n1} switch(dir) to { Sur -> {Poner(Verde)} Este -> {Poner(Verde)} Oeste -> {Poner(Verde)} Norte -> {Poner(Verde)}}}
      procedure X(dir){ Mover(dir) }
      function f(bool){ g := 2 if(False){ resultado := True} else { resultado := resultado} return (resultado)}"`);

    code.should.equal(null);
  });
});
