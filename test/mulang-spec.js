var should = require("should");
var _ = require("lodash");

var interpreter = require("../src/interpreter");
var mulang = require("../src/mulang");

var s = mulang.s;
var callable = mulang.callable;

function program(body) {
  return s("EntryPoint", ["program", body]);
}

var muNull = s("MuNull");
function reference(name) {
  return s("Reference", name);
}
function gbs(code) {
  return mulang.parse(interpreter.parseAll(code));
}


describe.skip("gobstones - mulang", function() {
  it("translates programs with return", function() {
    gbs("program { result := foo(); return (result) }").should.eql(
      program(s("Sequence", [
        s("Assignment",["result", s("Application", [reference("foo"), []])]),
        s("Return", reference("result"))]))
    );
  });

  it("translates simple Gobstones program", function() {
    gbs("program {}").should.eql(program(muNull));
  });

  it("translates simple procedure Call", function() {
    gbs("program{F()}").should.eql(program(s("Application", [reference("F"), []])));
  });

  it("translates simple procedure declaration ", function() {
    gbs("procedure F(){}").should.eql(callable("Procedure", "F", [], muNull));
  });

  it("translates simple procedure declaration and application  with a parameter", function() {
    var code = gbs("procedure Foo(p){}\nprogram{Foo(2)}");

    code.should.eql(
      s("Sequence", [
        program(s("Application", [reference("Foo"), [s("MuNumber", 2.0)]])),
        callable("Procedure", "Foo", [s("VariablePattern", "p")], muNull)]));
  });

  it("translates simple procedure Application ", function() {
    var code = gbs("program{Bar()} procedure Bar(){}");

    code.should.eql(s("Sequence", [
      program(s("Application", [reference("Bar"), []])),
      callable("Procedure", "Bar", [], muNull)]));
  });

  it("translates Poner", function() {
    var code = gbs("program{Poner(Verde)}");

    code.should.eql(
      program(s("Application", [reference("Poner"), [s("MuSymbol", "Verde")]])));
  });

  it("translates Sacar", function() {
    var code =  gbs("program{Sacar(Verde)}");

    code.should.eql(
      program(s("Application", [reference("Sacar"), [s("MuSymbol", "Verde")]])));
  });

  it("translates Mover", function() {
    var code = gbs("program{Mover(Este)}");

    code.should.eql(
      program(s("Application", [reference("Mover"), [s("MuSymbol", "Este")]])));
  });

  it("translates simple function declaration, with color return", function() {
    var code = gbs("function f(){return (Verde)}");

    code.should.eql(callable("Function", "f", [], s("Return", s("MuSymbol", "Verde"))));
  });

  it("translates simple function declaration, with numeric return", function() {
    var  code = gbs("function f(parameter){return (2)}");

    code.should.eql(
      callable("Function", "f", [s("VariablePattern", "parameter")], s("Return", s("MuNumber", 2))));
  });

  it("translates simple variable assignment of numbers", function() {
    var code = gbs("program{x:= 1}");

    code.should.eql(program(s("Assignment", ["x", s("MuNumber", 1)])));
  });

  it("translates simple variable assignment of colors", function() {
    var code = gbs("program{x:= Verde}");

    code.should.eql(program(s("Assignment", ["x", s("MuSymbol", "Verde")])));
  });

  it("translates simple variable assignment of booleans", function() {
    var code = gbs("program{x:= True}");

    code.should.eql(program(s("Assignment", ["x", s("MuBool", true)])));
  });

  it("translates simple variable assignment of directions", function() {
    var  code = gbs("program{x:= Este}");

    code.should.eql(program(s("Assignment", ["x", s("MuSymbol", "Este")])));
  });

  it("translates simple variable assignment of references", function() {
    var  code = gbs("program{x:= y}");

    code.should.eql(program(s("Assignment", ["x", reference("y")])));
  });

  it("translates simple variable assignment of application", function() {
    var code = gbs("program{x:= f(2)}");

    code.should.eql(
      program(s("Assignment", ["x", s("Application", [reference("f"), [s("MuNumber", 2.0)]])]))
    );
  });

  it("translates simple variable assignment if binary", function() {
    var code = gbs("program{x:= z && y}");

    code.should.eql(
      program(s("Assignment", ["x", s("Application", [reference("&&"), [reference("z"), reference("y")]])]))
    );
  });

  it("translates simple variable assignment of not", function() {
    var code = gbs("program{x:= not z}");

    code.should.eql(
      program(s("Assignment", ["x", s("Application", [reference("not"), [reference("z")]])]))
    );
  });

  it("translates simple variable assignment of nested binaries", function() {
    var code = gbs("program{x := True == 2 && x /= t}");

    code.should.eql(
      program(
        s("Assignment", [
          "x",
          s("Application", [
            reference("&&"), [
              s("Application", [s("Equal"),    [s("MuBool", true), s("MuNumber", 2.0)]]),
              s("Application", [s("NotEqual"), [reference("x"), reference("t")]])
            ]])]))
    );
  });

  it("translates simple procedure declaration and application  with a parameter", function() {
    var code = gbs("program{F(Negro)}\nprocedure F(parameter){}");

    code.should.eql(
      s("Sequence", [
        program(s("Application", [reference("F"), [s("MuSymbol", "Negro")]])),
        callable("Procedure", "F", [s("VariablePattern", "parameter")], muNull)
      ])
    );
  });

  it("translates conditional declaration", function() {
    var code = gbs("program{if(True){}}");

    code.should.eql(
      program(s("If", [s("MuBool", true), muNull, muNull]))
    );
  });

  it("translates conditional declaration, with branches", function() {
    var code = gbs("program{if(True){x := 1}}");

    code.should.eql(
      program(s("If", [
        s("MuBool", true),
        s("Assignment", ["x", s("MuNumber", 1.0)]),
        muNull]))
    );
  });

  it("translates while declaration", function() {
    var code = gbs("program{while(True){}}");

    code.should.eql(program(s("While", [s("MuBool", true), muNull])));
  });

  it("translates while declaration", function() {
    var code = gbs("program{while(True){x := 1}}");

    code.should.eql(
      program(s("While", [
        s("MuBool", true),
        s("Assignment", ["x", s("MuNumber", 1.0)])]))
    );
  });

  it("translates switch declaration", function() {
    var code = gbs("program{switch(5) to {3 -> {x := 4}}}");

    code.should.eql(
      program(
        s("Switch", [
          s("MuNumber", 5.0),
          [[s("MuNumber", 3.0), s("Assignment", ["x", s("MuNumber", 4.0)])]]]))
    );
  });

  it("translates repeat declaration", function() {
    var code = gbs("program{repeat(2){x := 2}}");

    code.should.eql(
      program(s("Repeat", [
        s("MuNumber", 2.0),
        s("Assignment", ["x", s("MuNumber", 2.0)])]))
    );
  });

  it("translates a complete program", function() {
    var code = gbs(`
      program {F(Verde) G(2,3) X(Este) y := f(False) }
      procedure F(x){ Poner(x) Poner(x) Poner(x) Sacar(x) }
      procedure G(n1,n2){ x := n1 z := n2 while(True){ x := n1} switch(dir) to { Sur -> {Poner(Verde)} Este -> {Poner(Verde)} Oeste -> {Poner(Verde)} Norte -> {Poner(Verde)}}}
      procedure X(dir){ Mover(dir) }
      function f(bool){ g := 2 if(False){ resultado := True} else { resultado := resultado} return (resultado)}`);

    code.should.not.eql(s("Other"));
  });
});
