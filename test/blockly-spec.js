should = require("should");
var blocklyCompiler = require("../src/blockly/blocklyCompiler");

var gsTestCode = function(name, xml, expectedCode, withRegions = false) {
  it(name, function(done) {
    blocklyCompiler.compile(xml, function(compiledCode) {
      compiledCode.should.equal(expectedCode);
      done();
    }, withRegions);
  });
};

// These are the tests of https://github.com/Program-AR/gs-element-blockly/tree/0.9.1/test

describe("blockly headless", function() {

  // COMANDOS

  gsTestCode('Programa vacío',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Program" deletable="false" movable="false" editable="false" x="30" y="30"><statement name="program"></statement></block></xml>',
    'program {\n}\n');

  gsTestCode('Poner',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Poner"><value name="COLOR"><block type="ColorSelector"><field name="ColorDropdown">Rojo</field></block></value></block></xml>',
    `Poner(Rojo)\n`);

  gsTestCode('Sacar',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Sacar"><value name="COLOR"><block type="ColorSelector"><field name="ColorDropdown">Verde</field></block></value></block></xml>',
    `Sacar(Verde)\n`);

  gsTestCode('Mover',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Mover"><value name="DIRECCION"><block type="DireccionSelector"><field name="DireccionDropdown">Oeste</field></block></value></block></xml>',
    `Mover(Oeste)\n`);

  gsTestCode('IrAlBorde',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="IrAlBorde"><value name="DIRECCION"><block type="DireccionSelector"><field name="DireccionDropdown">Norte</field></block></value></block></xml>',
    `IrAlBorde(Norte)\n`);

  gsTestCode('VaciarTablero',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="VaciarTablero"></block></xml>',
    `VaciarTablero()\n`);

  gsTestCode('BOOM',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="BOOM"></block></xml>',
    `BOOM("Ingresar motivo...")\n`);

  gsTestCode('BOOM sanitiza comillas',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="BOOM"><field name="boomDescription">Chor"lito</field></block></xml>',
    `BOOM("Chor'lito")\n`);

  gsTestCode('BOOM omite comillas finales e iniciales',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="BOOM"><field name="boomDescription">""Chor"lito"</field></block></xml>',
    `BOOM("'Chor'lito")\n`);

  gsTestCode('Procedimiento',
  '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="procedures_defnoreturn"><mutation><arg name="valor1"></arg><arg name="otroValor"></arg></mutation><field name="NAME">hacer algo con parametros</field><comment pinned="false" h="80" w="160">Un comentario para el procedimiento</comment></block></xml>',
  `//
// Un comentario para el procedimiento
//
procedure HacerAlgoConParametros(valor1, otroValor) {
}\n`);

  gsTestCode('Procedimiento sin parámetros',
  '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="procedures_defnoreturnnoparams" id="7.WqYnDK,%AyDkn]|W[A" x="30" y="-53"><field name="NAME">Hacer algo</field><comment pinned="false" h="80" w="160">Desc del procedure</comment><statement name="STACK"><block type="Poner" id="CAG,1GO#L(~dKF(`l3Pg"></block></statement></block><block type="Program" id="mrH;=*5x58d@d@)e6_%D" deletable="false" movable="false" editable="false" x="30" y="30"><statement name="program"><block type="procedures_callnoreturnnoparams" id="##h_(l?bVZ3ib~o`|j,F"><mutation name="Hacer algo"></mutation></block></statement></block></xml>',
    `//
// Desc del procedure
//
procedure HacerAlgo() {
  Poner()
}


program {
  HacerAlgo()
}\n`);

  gsTestCode('Función pura',
  '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="Program" id="MT6=3~!F@#2M!|~{}J[_" x="30" y="30"><statement name="program"><block type="Poner" id="^pe-vNTX(`E3_WS*i)C("><value name="COLOR"><block type="procedures_callreturnsimple" id="?cZ6M@Tb[z=sfj)pVtRV"><mutation name="devolver algo"></mutation></block></value></block></statement></block><block type="procedures_defreturnsimple" id="(0xJ:(i7EX]6`l[#!pb," x="29" y="153"><mutation statements="false"></mutation><field name="NAME">devolver algo</field><value name="RETURN"><block type="ColorSelector" id="zy0ET}dx{(l_/@ysONL("><field name="ColorDropdown">Rojo</field></block></value></block></xml>',
    `function devolverAlgo() {
  return (Rojo)
}


program {
  Poner(devolverAlgo())
}\n`);

  gsTestCode('Función pura parametrizada',
  '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="procedures_defreturnsimplewithparams" id="OMx*|y/u93_;{)/:ccu#" x="75" y="25"><mutation statements="false"><arg name="x"></arg></mutation><field name="NAME">doble</field><value name="RETURN"><block type="OperadorNumerico" id="A?32z4OOoj7fhG$ZcR5F"><field name="OPERATOR">+</field><value name="arg1"><block type="variables_get" id=":,nnUDn1M#f3Z`U9BX,K"><mutation var="x"></mutation></block></value><value name="arg2"><block type="variables_get" id="yXc3JLm.]viK4$~+Xw]r"><mutation var="x"></mutation></block></value></block></value></block><block type="Program" id="GA843XT.)sE1~C[Non9w" deletable="false" x="44" y="155"><mutation timestamp="1509516775623"></mutation><statement name="program"><block type="RepeticionSimple" id="h_+ZaI_b2XipY3U,nDX("><value name="count"><block type="procedures_callreturnsimplewithparams" id="r93jBy6n6qGV_u1{8h1B"><mutation name="doble"><arg name="x"></arg></mutation><value name="ARG0"><block type="math_number" id="wu!JBccEoGwX)=+QNa@5"><field name="NUM">2</field></block></value></block></value><statement name="block"><block type="Poner" id="fX2WzGga]gNg!#0ImYE^"><value name="COLOR"><block type="ColorSelector" id="G5=n=ZS|%Z=nl7:,6s_="><field name="ColorDropdown">Rojo</field></block></value></block></statement></block></statement></block></xml>',
    `function doble(x) {
  return (x + x)
}


program {
  repeat(doble(2)) {
    Poner(Rojo)
  }
}\n`);

  gsTestCode('AlternativaSimple',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Program" deletable="false" movable="false" editable="false" x="30" y="30"><statement name="program"><block type="AlternativaSimple"><value name="condicion"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value><statement name="block"><block type="Poner"><value name="COLOR"><block type="ColorSelector"><field name="ColorDropdown">Rojo</field></block></value></block></statement></block></statement></block></xml>',
    `program {
  if (True) {
    Poner(Rojo)
  }
}\n`);

  gsTestCode('AlternativaCompleta',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="Program" id=".)lJS!4;?t(uzqy3pPHG" deletable="false" movable="false" editable="false" x="30" y="30"><mutation timestamp="1510689378113"></mutation><statement name="program"><block type="AlternativaCompleta" id="`g!0-)%FA;`PH3_x=?!A"><mutation else="1"></mutation><value name="condicion"><block type="BoolSelector" id="-*w`VB](Kef(=k%f!nar"><field name="BoolDropdown">True</field></block></value><statement name="block1"><block type="Poner" id="gK{ipr6+XOqbEq_Xg1J9"><value name="COLOR"><block type="ColorSelector" id="hV%u1T/Mu?;9wL#eB_^Z"><field name="ColorDropdown">Rojo</field></block></value></block></statement><statement name="block2"><block type="Sacar" id="~B};/=rl_?UGOC)h+`M`"><value name="COLOR"><block type="ColorSelector" id="/]eSqaffOw8P%z|wD2^I"><field name="ColorDropdown">Verde</field></block></value></block></statement></block></statement></block></xml>',
    `program {
  if (True) {
    Poner(Rojo)
  } else {
    Sacar(Verde)
  }
}\n`);

  gsTestCode('AlternativaCompletaConElseIf',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="Program" id="y8K3OFY%JsjCm*Uq#Dpv" deletable="false" x="30" y="30"><mutation timestamp="1510202309441"></mutation><statement name="program"><block type="AlternativaCompleta" id="MNWz6E`^5ngI]7.%$IUb"><mutation elseif="2" else="1"></mutation><value name="condicion"><block type="puedeMover" id="fe`{wjLfdqTen-noo6c#"><value name="VALUE"><block type="DireccionSelector" id="+UF:VdCz;*AmRK_N75:e"><field name="DireccionDropdown">Este</field></block></value></block></value><statement name="block1"><block type="Poner" id="`F=BEfI=j]PBZOHRfzNF"><value name="COLOR"><block type="ColorSelector" id="SHzOCNnimV7p(z3p[;^Y"><field name="ColorDropdown">Rojo</field></block></value></block></statement><value name="IF1"><block type="puedeMover" id="(.qrOTHG#!n_(nkLSQIa"><value name="VALUE"><block type="DireccionSelector" id="y(GmjFvgNX=*I/KqH+]h"><field name="DireccionDropdown">Oeste</field></block></value></block></value><statement name="DO1"><block type="Sacar" id="P?[YJ0ODfr,P;gZE(+qk"><value name="COLOR"><block type="ColorSelector" id="i5l)K1SmEIRjr9^kQznG"><field name="ColorDropdown">Rojo</field></block></value></block></statement><value name="IF2"><block type="puedeMover" id="YqAavI[#eOn*!|0$(^C@"><value name="VALUE"><block type="DireccionSelector" id="#{,JB!j%U{R35s$7?G[b"><field name="DireccionDropdown">Sur</field></block></value></block></value><statement name="block2"><block type="Mover" id="fs,N4-6ghnxOu!U@(prl"><value name="DIRECCION"><block type="DireccionSelector" id="YIkD:CzF0hlJd3v1q^[_"><field name="DireccionDropdown">Este</field></block></value></block></statement></block></statement></block></xml>',
    `program {
  if (puedeMover(Este)) {
    Poner(Rojo)
  } elseif (puedeMover(Oeste)) {
    Sacar(Rojo)
  } elseif (puedeMover(Sur)) {
  } else {
    Mover(Este)
  }
}\n`);

  gsTestCode('Repetición Simple',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Program" deletable="false" movable="false" editable="false" x="30" y="30"><statement name="program"><block type="RepeticionSimple"><value name="count"><block type="math_number"><field name="NUM">5</field></block></value><statement name="block"><block type="Mover"><value name="DIRECCION"><block type="DireccionSelector"><field name="DireccionDropdown">Este</field></block></value></block></statement></block></statement></block></xml>',
    `program {
  repeat(5) {
    Mover(Este)
  }
}\n`);

  gsTestCode('Llamada a procedimiento',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Program" deletable="false" movable="false" editable="false"><statement name="program"><block type="procedures_callnoreturn"><mutation name="hacer algo con"><arg name="x"></arg><arg name="y"></arg></mutation><value name="ARG0"><block type="ColorSelector"><field name="ColorDropdown">Rojo</field></block></value><value name="ARG1"><block type="ColorSelector"><field name="ColorDropdown">Verde</field></block></value></block></statement></block><block type="procedures_defnoreturn"><mutation><arg name="x"></arg><arg name="y"></arg></mutation><field name="NAME">hacer algo con</field><comment></comment></block></xml>',
    `procedure HacerAlgoCon(x, y) {
}


program {
  HacerAlgoCon(Rojo, Verde)
}\n`);

  gsTestCode('Nombre de procedimiento acepta eñes y tildes',
    `<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="Program" id=")/i9X3Dkcy@_$dH-T^zG" deletable="false" x="30" y="30"><mutation timestamp="1509993436591"></mutation><statement name="program"><block type="procedures_callnoreturnnoparams" id="D|9vDEzTXWyhJZ7y(DAh"><mutation name="Ñáñaras en el occipucioÁáÉéÍíÓóÚú"></mutation></block></statement></block><block type="procedures_defnoreturnnoparams" id="P7)*c#QiF%zUE13b}+(1" x="37" y="115"><field name="NAME">Ñáñaras en el occipucioÁáÉéÍíÓóÚú</field></block></xml>`,
    `procedure ÑáñarasEnElOccipucioÁáÉéÍíÓóÚú() {
}


program {
  ÑáñarasEnElOccipucioÁáÉéÍíÓóÚú()
}\n`);

    gsTestCode('Asignacion variable',
      '<xml><block type="Program"><statement name="program"><block type="Asignacion"><field name="varName">x</field><value name="varValue"><block type="ColorSelector"><field name="ColorDropdown">Rojo</field></block></value><next><block type="Poner"><value name="COLOR"><block type="variables_get"><mutation var="x"></mutation></block></value></block></next></block></statement></block></xml>',
      `program {
  x := Rojo
  Poner(x)
}\n`);

    gsTestCode('Asignacion variable formatea bien',
      '<xml><block type="Program"><statement name="program"><block type="Asignacion"><field name="varName">Pasa a camel</field><value name="varValue"><block type="ColorSelector"><field name="ColorDropdown">Rojo</field></block></value><next><block type="Poner"><value name="COLOR"><block type="variables_get"><mutation var="Pasa a camel"></mutation></block></value></block></next></block></statement></block></xml>',
      `program {
  pasaACamel := Rojo
  Poner(pasaACamel)
}\n`);

  gsTestCode('Programa interactivo simple',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="InteractiveProgram" id="${CGuk~7{sSlYdtq}{?Y" deletable="false" x="-7" y="25"><mutation timestamp="1509521036701"></mutation><statement name="interactiveprogram"><block type="InteractiveKeyBinding" id="6om}mHe,(P0sGz#1.7Yt"><mutation modifierscount="0"></mutation><field name="InteractiveBindingDropdownKey">ARROW_LEFT</field><statement name="block"><block type="Poner" id="BabEe00ufbd6`O}XfVvE"><value name="COLOR"><block type="ColorSelector" id=",0o~IWU5%DLohW[By1#v"><field name="ColorDropdown">Rojo</field></block></value></block></statement><next><block type="InteractiveLetterBinding" id="O9U+of9+(D.[.(rssdlq"><mutation modifierscount="3"></mutation><field name="InteractiveBindingDropdownKey">A</field><field name="d1">SHIFT</field><field name="d2">CTRL</field><field name="d3">ALT</field><statement name="block"><block type="Poner" id="S*ySXAm#eg2Uv:B|T4D^"><value name="COLOR"><block type="ColorSelector" id="`^5)~+rKBrK$IW3,:,@."><field name="ColorDropdown">Verde</field></block></value></block></statement><next><block type="InteractiveNumberBinding" id="VZ^AhWsStU_E+Q(1:@Zs"><mutation modifierscount="2"></mutation><field name="InteractiveBindingDropdownKey">1</field><field name="d1">CTRL</field><field name="d2">SHIFT</field><statement name="block"><block type="Poner" id="$vIU@NWv3kHg#P-0i#P0"><value name="COLOR"><block type="ColorSelector" id="wqa{Z.4vMhl)L;Iwz5Eg"><field name="ColorDropdown">Azul</field></block></value></block></statement></block></next></block></next></block></statement></block></xml>',
    `interactive program {
  K_ARROW_LEFT -> {
    Poner(Rojo)
  }
  K_CTRL_ALT_SHIFT_A -> {
    Poner(Verde)
  }
  K_CTRL_SHIFT_1 -> {
    Poner(Azul)
  }
}\n`);

  gsTestCode('Programa interactivo con init y timeout',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="InteractiveProgram" id="${CGuk~7{sSlYdtq}{?Y" deletable="false" x="67" y="8"><mutation init="true" timeout="500" timestamp="1509521133888"></mutation><statement name="interactiveprogram"><block type="InteractiveKeyBinding" id="4b4ScAr./*UfqTMf[tWd"><mutation modifierscount="0"></mutation><field name="InteractiveBindingDropdownKey">TAB</field><statement name="block"><block type="Poner" id="dzFh(}!u[Cjoc?L3B0e:"><value name="COLOR"><block type="ColorSelector" id="tu2[`y^6|#@tSuhX6@h9"><field name="ColorDropdown">Negro</field></block></value></block></statement></block></statement><statement name="init"><block type="Poner" id="rHVRgg_m#-%.vKT9^,9w"><value name="COLOR"><block type="ColorSelector" id="byWOHpg*;!wzY%?Q8EZO"><field name="ColorDropdown">Rojo</field></block></value></block></statement><statement name="timeout"><block type="Poner" id="a1=)WHQjAh8eTEEdDgEv"><value name="COLOR"><block type="ColorSelector" id="Gyy*W`^63WBtIq?}Q*w8"><field name="ColorDropdown">Verde</field></block></value></block></statement></block></xml>',
    `interactive program {
  INIT -> {
  Poner(Rojo)
  }
  K_TAB -> {
    Poner(Negro)
  }
  TIMEOUT(500) -> {
  Poner(Verde)
  }
}\n`);

  gsTestCode('Comando Completar',
      '<xml><block type="Program"><statement name="program"><block type="ComandoCompletar"><next><block type="Poner"><value name="COLOR"><block type="ColorSelector"><field name="ColorDropdown">Rojo</field></block></value></block></next></block></statement></block></xml>',
      `program {
  BOOM("El programa todavía no está completo")
  Poner(Rojo)
}\n`);

  gsTestCode('Comandos y expresiones con parámetros sin rellenar deben devolver código en blanco',
      '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="Program" id="!sG7LchMD3N[60^Mz#2^" deletable="false" x="30" y="30"><mutation timestamp="1510072375269"></mutation><statement name="program"><block type="Poner" id="Y7GT)6A;*h[v@[_32-_-"><next><block type="Sacar" id="/MWG]aNn#0Asxc`l%j*E"><next><block type="Mover" id="G#i.xQ?JC#!DL[??S%##"><next><block type="IrAlBorde" id="fkUTa_B3tRz9Ez^?*0+9"><next><block type="BOOM" id="8z_(nzT%OIxrQ5b^Y9)q"><field name="boomDescription">Ingresar motivo...</field><next><block type="procedures_callnoreturn" id="::nFHVcC)nG#jAZ*Q+`?"><mutation name="Hacer algo"><arg name="asdf"></arg></mutation><next><block type="AlternativaSimple" id="ipHIXS=a-rG8cU@6a]ug"><next><block type="AlternativaCompleta" id="*O*Ee`VLoQGfcI6WKJL2"><next><block type="RepeticionSimple" id="P8m250kum!I3K64H.c*q"><next><block type="RepeticionCondicional" id="4[228L5NIsjd9+!px1sx"><next><block type="Asignacion" id="VTzYFzn(]bALkWhc8Z$_"><field name="varName">nombre de variable</field><value name="varValue"><block type="hayBolitas" id="?HHLu?2kGS0W^0drCL.T"></block></value><next><block type="Asignacion" id="Hc]*JK9U)E7]H8!C:iQR"><field name="varName">nombre de variable</field><value name="varValue"><block type="puedeMover" id="z[Wl{qWNz=4!]8L,yf0;"></block></value><next><block type="Asignacion" id="X.@8HDfu*]3`I[Nt!6Ri"><field name="varName">nombre de variable</field><value name="varValue"><block type="nroBolitas" id="zfLRecgF8degn7c|uIN^"></block></value><next><block type="Asignacion" id="Vl#cFK!5AX``#`DX$H1-"><field name="varName">nombre de variable</field><value name="varValue"><block type="OperadorNumerico" id="C@(@bp{Vrv}Tm[NHJCE$"><field name="OPERATOR">+</field></block></value><next><block type="Asignacion" id="Jykp+X_!k=/fbS_@0QfW"><field name="varName">nombre de variable</field><value name="varValue"><block type="OperadorDeComparacion" id="CQ9rs;hW77XR+:JWe.,J"><field name="RELATION">==</field></block></value><next><block type="Asignacion" id="s|H;4).^THhxp]b+JJku"><field name="varName">nombre de variable</field><value name="varValue"><block type="OperadorLogico" id="YG]0KQ@y[X4+!sa|!l}_"><field name="OPERATOR">&amp;&amp;</field></block></value><next><block type="Asignacion" id="t2ilzMHdanhC(WJb~++V"><field name="varName">nombre de variable</field><value name="varValue"><block type="not" id="h07SqD_{9zF4Jy*Jo4=W"></block></value><next><block type="Asignacion" id="5h)|u,,vM}opx60u?2%X"><field name="varName">nombre de variable</field><value name="varValue"><block type="siguiente" id="1$;XX-Xn|QrUAsOWM$)!"></block></value><next><block type="Asignacion" id="Kp=Ga0Nk(!shr:y}My0y"><field name="varName">nombre de variable</field><value name="varValue"><block type="previo" id="4!KOQ]?QJOr5B_FX*z8C"></block></value><next><block type="Asignacion" id="gV_a!5.YB.fZF%+%!ieg"><field name="varName">nombre de variable</field><value name="varValue"><block type="opuesto" id="a)4dC./3HZC*K!!WC27?"></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block><block type="procedures_defnoreturn" id="H+mCH!$B@eUpijw#xe:0" x="271" y="32"><mutation><arg name="asdf"></arg></mutation><field name="NAME">Hacer algo</field></block></xml>',
      `procedure HacerAlgo(asdf) {
}


program {
  Poner()
  Sacar()
  Mover()
  IrAlBorde()
  BOOM("Ingresar motivo...")
  HacerAlgo()
  if () {
  }
  if () {
  } else {
  }
  repeat() {
  }
  while (not ()) {
  }
  nombreDeVariable := hayBolitas()
  nombreDeVariable := puedeMover()
  nombreDeVariable := nroBolitas()
  nombreDeVariable := () + ()
  nombreDeVariable := () == ()
  nombreDeVariable := () && ()
  nombreDeVariable := not()
  nombreDeVariable := siguiente()
  nombreDeVariable := previo()
  nombreDeVariable := opuesto()
}\n`);

  // EXPRESIONES

  gsTestCode('|| se genera bien',
    '<xml><block type="OperadorLogico"><field name="OPERATOR">&amp;&amp;</field><value name="arg1"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="BoolSelector"><field name="BoolDropdown">False</field></block></value></block></xml>',
    'True && False'
  );
  gsTestCode('|| se genera bien',
    '<xml><block type="OperadorLogico"><field name="OPERATOR">||</field><value name="arg1"><block type="BoolSelector"><field name="BoolDropdown">False</field></block></value><value name="arg2"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value></block></xml>',
    'False || True'
  );
  gsTestCode('|| se genera bien',
    '<xml><block type="OperadorLogico"><field name="OPERATOR">&amp;&amp;</field><value name="arg1"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="OperadorLogico"><field name="OPERATOR">||</field><value name="arg1"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value></block></value></block></xml>',
    'True && (True || True)'
  );
  gsTestCode('Anidación de || dentro de && provoca paréntesis',
    '<xml><block type="OperadorLogico"><field name="OPERATOR">&amp;&amp;</field><value name="arg1"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="OperadorLogico"><field name="OPERATOR">||</field><value name="arg1"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value></block></value></block></xml>',
    'True && (True || True)'
  );
  gsTestCode('Anidación de && dentro de || no provoca paréntesis',
    '<xml><block type="OperadorLogico"><field name="OPERATOR">||</field><value name="arg1"><block type="OperadorLogico"><field name="OPERATOR">&amp;&amp;</field><value name="arg1"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value></block></value><value name="arg2"><block type="BoolSelector"><field name="BoolDropdown">True</field></block></value></block></xml>',
    'True && True || True'
  );

  gsTestCode('hayBolitas',
    '<xml><block type="hayBolitas"><value name="VALUE"><block type="ColorSelector"><field name="ColorDropdown">Rojo</field></block></value></block></xml>',
    'hayBolitas(Rojo)'
  );

  gsTestCode('nroBolitas',
    '<xml><block type="nroBolitas"><value name="VALUE"><block type="ColorSelector"><field name="ColorDropdown">Rojo</field></block></value></block></xml>',
    'nroBolitas(Rojo)'
  );

  gsTestCode('puedeMover',
    '<xml><block type="puedeMover"><value name="VALUE"><block type="DireccionSelector"><field name="DireccionDropdown">Este</field></block></value></block></xml>',
    'puedeMover(Este)'
  );

  gsTestCode('siguiente',
    '<xml><block type="siguiente"><value name="VALUE"><block type="DireccionSelector"><field name="DireccionDropdown">Este</field></block></value></block></xml>',
    'siguiente(Este)'
  );

  gsTestCode('previo',
    '<xml><block type="previo"><value name="VALUE"><block type="DireccionSelector"><field name="DireccionDropdown">Este</field></block></value></block></xml>',
    'previo(Este)'
  );

  gsTestCode('opuesto',
    '<xml><block type="opuesto"><value name="VALUE"><block type="DireccionSelector"><field name="DireccionDropdown">Este</field></block></value></block></xml>',
    'opuesto(Este)'
  );

  gsTestCode('Funciones',
  '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="procedures_defreturn" id="+gqlq+YuvCEMmS6F61{-" x="18" y="-49"><field name="NAME">devolver algun valor</field><comment pinned="false" h="80" w="160">Comentario de lo que devuelve</comment><statement name="STACK"><block type="Mover" id="NCfiiVVe_B-`PMM1+kD^"><value name="DIRECCION"><block type="DireccionSelector" id="Dv4N-v/Zlt~n!R|IJtWe"><field name="DireccionDropdown">Este</field></block></value></block></statement><value name="RETURN"><block type="ColorSelector" id="g:f8pLgHC1}i]ou!MFq1"><field name="ColorDropdown">Rojo</field></block></value></block><block type="Program" id="twZ(|C[;{.q7Y=]W*iNv" deletable="false" movable="false" editable="false" x="30" y="30"><statement name="program"><block type="Poner" id="jgtnboH^Cx^^UT0%!#j`"><value name="COLOR"><block type="procedures_callreturn" id="5O:f6l?E-j8LT{YTjr;_"><mutation name="devolver algun valor"></mutation></block></value></block></statement></block></xml>',
    `//
// Comentario de lo que devuelve
//
function devolverAlgunValor() {
  Mover(Este)
  return (Rojo)
}


program {
  Poner(devolverAlgunValor())
}\n`);

  gsTestCode('Sanitiza bien los parametros',
  '<xml><block type="procedures_defreturnsimplewithparams" id="wER^h(R3^R3dfWRXEQ?t" x="47" y="138"><mutation statements="false"><arg name="Ñáñaras en el Occipucio"></arg></mutation><field name="NAME">devolver algo</field><value name="RETURN"><block type="variables_get" id="w_#.et_BWPs__E]]Di+F"><mutation var="Ñáñaras en el Occipucio"></mutation></block></value></block></xml>',
    `function devolverAlgo(ñáñarasEnElOccipucio) {
  return (ñáñarasEnElOccipucio)
}
`);

  gsTestCode('Expresión Completar',
    '<xml><block type="ExpresionCompletar"></block></xml>',
    'boom("El programa todavía no está completo")'
  );

  // REGIONS

  // --------------------------------------------------
  // ------- EXPRESIONES ------------------------------
  // --------------------------------------------------

  gsTestCode('&& se genera bien',
  '<xml><block type="OperadorLogico" id="and"><field name="OPERATOR">&amp;&amp;</field><value name="arg1"><block type="BoolSelector" id="true"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="BoolSelector" id="false"><field name="BoolDropdown">False</field></block></value></block></xml>',
  '/*@BEGIN_REGION@and@*//*@BEGIN_REGION@true@*/True/*@END_REGION@*/ && /*@BEGIN_REGION@false@*/False/*@END_REGION@*//*@END_REGION@*/',
  true
);
gsTestCode('|| se genera bien',
  '<xml><block type="OperadorLogico" id="or"><field name="OPERATOR">||</field><value name="arg1"><block type="BoolSelector" id="false"><field name="BoolDropdown">False</field></block></value><value name="arg2"><block type="BoolSelector" id="true"><field name="BoolDropdown">True</field></block></value></block></xml>',
  '/*@BEGIN_REGION@or@*//*@BEGIN_REGION@false@*/False/*@END_REGION@*/ || /*@BEGIN_REGION@true@*/True/*@END_REGION@*//*@END_REGION@*/',
  true
);
gsTestCode('|| se genera  con paréntesis',
  '<xml><block type="OperadorLogico" id="and"><field name="OPERATOR">&amp;&amp;</field><value name="arg1"><block type="BoolSelector" id="true1"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="OperadorLogico" id="or"><field name="OPERATOR">||</field><value name="arg1"><block type="BoolSelector" id="true2"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="BoolSelector" id="true3"><field name="BoolDropdown">True</field></block></value></block></value></block></xml>',
  '/*@BEGIN_REGION@and@*//*@BEGIN_REGION@true1@*/True/*@END_REGION@*/ && (/*@BEGIN_REGION@or@*//*@BEGIN_REGION@true2@*/True/*@END_REGION@*/ || /*@BEGIN_REGION@true3@*/True/*@END_REGION@*//*@END_REGION@*/)/*@END_REGION@*/',
  true
);
gsTestCode('Anidación de || dentro de && provoca paréntesis',
  '<xml><block type="OperadorLogico" id="and"><field name="OPERATOR">&amp;&amp;</field><value name="arg1"><block type="BoolSelector" id="true1"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="OperadorLogico" id="or"><field name="OPERATOR">||</field><value name="arg1"><block type="BoolSelector" id="true2"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="BoolSelector" id="true3"><field name="BoolDropdown">True</field></block></value></block></value></block></xml>',
  '/*@BEGIN_REGION@and@*//*@BEGIN_REGION@true1@*/True/*@END_REGION@*/ && (/*@BEGIN_REGION@or@*//*@BEGIN_REGION@true2@*/True/*@END_REGION@*/ || /*@BEGIN_REGION@true3@*/True/*@END_REGION@*//*@END_REGION@*/)/*@END_REGION@*/',
  true
);
gsTestCode('Anidación de && dentro de || no provoca paréntesis',
  '<xml><block type="OperadorLogico" id="or"><field name="OPERATOR">||</field><value name="arg1"><block type="OperadorLogico" id="and"><field name="OPERATOR">&amp;&amp;</field><value name="arg1"><block type="BoolSelector" id="true1"><field name="BoolDropdown">True</field></block></value><value name="arg2"><block type="BoolSelector" id="true2"><field name="BoolDropdown">True</field></block></value></block></value><value name="arg2"><block type="BoolSelector" id="true3"><field name="BoolDropdown">True</field></block></value></block></xml>',
  '/*@BEGIN_REGION@or@*//*@BEGIN_REGION@and@*//*@BEGIN_REGION@true1@*/True/*@END_REGION@*/ && /*@BEGIN_REGION@true2@*/True/*@END_REGION@*//*@END_REGION@*/ || /*@BEGIN_REGION@true3@*/True/*@END_REGION@*//*@END_REGION@*/',
  true
);

gsTestCode('hayBolitas',
  '<xml><block type="hayBolitas" id="hb"><value name="VALUE"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value></block></xml>',
  '/*@BEGIN_REGION@hb@*/hayBolitas(/*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/)/*@END_REGION@*/',
  true
);

gsTestCode('nroBolitas',
  '<xml><block type="nroBolitas" id="nb"><value name="VALUE"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value></block></xml>',
  '/*@BEGIN_REGION@nb@*/nroBolitas(/*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/)/*@END_REGION@*/',
  true
);

gsTestCode('puedeMover',
  '<xml><block type="puedeMover" id="pm"><value name="VALUE"><block type="DireccionSelector" id="este"><field name="DireccionDropdown">Este</field></block></value></block></xml>',
  '/*@BEGIN_REGION@pm@*/puedeMover(/*@BEGIN_REGION@este@*/Este/*@END_REGION@*/)/*@END_REGION@*/',
  true
);

gsTestCode('siguiente',
  '<xml><block type="siguiente" id="sg"><value name="VALUE"><block type="DireccionSelector" id="este"><field name="DireccionDropdown">Este</field></block></value></block></xml>',
  '/*@BEGIN_REGION@sg@*/siguiente(/*@BEGIN_REGION@este@*/Este/*@END_REGION@*/)/*@END_REGION@*/',
  true
);

gsTestCode('previo',
  '<xml><block type="previo" id="pr"><value name="VALUE"><block type="DireccionSelector" id="este"><field name="DireccionDropdown">Este</field></block></value></block></xml>',
  '/*@BEGIN_REGION@pr@*/previo(/*@BEGIN_REGION@este@*/Este/*@END_REGION@*/)/*@END_REGION@*/',
  true
);

gsTestCode('opuesto',
  '<xml><block type="opuesto" id="op"><value name="VALUE"><block type="DireccionSelector" id="este"><field name="DireccionDropdown">Este</field></block></value></block></xml>',
  '/*@BEGIN_REGION@op@*/opuesto(/*@BEGIN_REGION@este@*/Este/*@END_REGION@*/)/*@END_REGION@*/',
  true
);

gsTestCode('Funciones',
'<xml xmlns="http://www.w3.org/1999/xhtml"><block type="procedures_defreturn" id="f1" x="18" y="-49"><field name="NAME">devolver algun valor</field><comment pinned="false" h="80" w="160">Comentario de lo que devuelve</comment><statement name="STACK"><block type="Mover" id="mover"><value name="DIRECCION"><block type="DireccionSelector" id="este"><field name="DireccionDropdown">Este</field></block></value></block></statement><value name="RETURN"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value></block><block type="Program" id="program" deletable="false" movable="false" editable="false" x="30" y="30"><statement name="program"><block type="Poner" id="poner"><value name="COLOR"><block type="procedures_callreturn" id="cf1"><mutation name="devolver algun valor"></mutation></block></value></block></statement></block></xml>',
  `/*@BEGIN_REGION@f1@*/
//
// Comentario de lo que devuelve
//
function devolverAlgunValor() {
  /*@BEGIN_REGION@mover@*/
  Mover(/*@BEGIN_REGION@este@*/Este/*@END_REGION@*/)
  /*@END_REGION@*/
  return (/*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/)
}
/*@END_REGION@*/


/*@BEGIN_REGION@program@*/\nprogram {
  /*@BEGIN_REGION@poner@*/
  Poner(/*@BEGIN_REGION@cf1@*/devolverAlgunValor()/*@END_REGION@*/)
  /*@END_REGION@*/
}\n/*@END_REGION@*/\n`,
true);

gsTestCode('Expresión Completar',
  '<xml><block type="ExpresionCompletar" id="completar"></block></xml>',
  '/*@BEGIN_REGION@completar@*/boom("El programa todavía no está completo")/*@END_REGION@*/',
  true
);

// --------------------------------------------------
// ------- COMANDOS ---------------------------------
// --------------------------------------------------

  gsTestCode('Programa vacío',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Program" id="1" deletable="false" movable="false" editable="false" x="30" y="30"><statement name="program"></statement></block></xml>',
    '/*@BEGIN_REGION@1@*/\nprogram {\n}\n/*@END_REGION@*/\n',
    true);

  gsTestCode('Poner',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Poner" id="poner"><value name="COLOR"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value></block></xml>',
    `/*@BEGIN_REGION@poner@*/
Poner(/*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/)
/*@END_REGION@*/\n`,
    true);

  gsTestCode('Sacar',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Sacar" id="sacar"><value name="COLOR"><block type="ColorSelector" id="verde"><field name="ColorDropdown">Verde</field></block></value></block></xml>',
    `/*@BEGIN_REGION@sacar@*/
Sacar(/*@BEGIN_REGION@verde@*/Verde/*@END_REGION@*/)
/*@END_REGION@*/\n`,
    true);

  gsTestCode('Mover',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Mover" id="mover"><value name="DIRECCION"><block type="DireccionSelector" id="oeste"><field name="DireccionDropdown">Oeste</field></block></value></block></xml>',
    `/*@BEGIN_REGION@mover@*/
Mover(/*@BEGIN_REGION@oeste@*/Oeste/*@END_REGION@*/)
/*@END_REGION@*/\n`,
    true);

  gsTestCode('IrAlBorde',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="IrAlBorde" id="irBorde"><value name="DIRECCION"><block type="DireccionSelector" id="norte"><field name="DireccionDropdown">Norte</field></block></value></block></xml>',
    `/*@BEGIN_REGION@irBorde@*/
IrAlBorde(/*@BEGIN_REGION@norte@*/Norte/*@END_REGION@*/)
/*@END_REGION@*/\n`,
    true);

  gsTestCode('VaciarTablero',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="VaciarTablero" id="vaciar"></block></xml>',
    `/*@BEGIN_REGION@vaciar@*/
VaciarTablero()
/*@END_REGION@*/\n`,
    true);

  gsTestCode('BOOM',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="BOOM" id="boom"></block></xml>',
    `/*@BEGIN_REGION@boom@*/
BOOM("Ingresar motivo...")
/*@END_REGION@*/\n`,
    true);

  gsTestCode('Procedimiento',
  '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="procedures_defnoreturn" id="defP"><mutation><arg name="valor1"></arg><arg name="otroValor"></arg></mutation><field name="NAME">hacer algo con parametros</field><comment pinned="false" h="80" w="160">Un comentario para el procedimiento</comment></block></xml>',
  `/*@BEGIN_REGION@defP@*/
//
// Un comentario para el procedimiento
//
procedure HacerAlgoConParametros(valor1, otroValor) {
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('Procedimiento sin parámetros',
  '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="procedures_defnoreturnnoparams" id="p1" x="30" y="-53"><field name="NAME">Hacer algo</field><comment pinned="false" h="80" w="160">Desc del procedure</comment><statement name="STACK"><block type="Poner" id="poner"></block></statement></block><block type="Program" id="program" deletable="false" movable="false" editable="false" x="30" y="30"><statement name="program"><block type="procedures_callnoreturnnoparams" id="cp1"><mutation name="Hacer algo"></mutation></block></statement></block></xml>',
    `/*@BEGIN_REGION@p1@*/
//
// Desc del procedure
//
procedure HacerAlgo() {
  /*@BEGIN_REGION@poner@*/
  Poner()
  /*@END_REGION@*/
}
/*@END_REGION@*/


/*@BEGIN_REGION@program@*/
program {
  /*@BEGIN_REGION@cp1@*/
  HacerAlgo()
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('Función pura',
  '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="Program" id="program" x="30" y="30"><statement name="program"><block type="Poner" id="poner"><value name="COLOR"><block type="procedures_callreturnsimple" id="f1"><mutation name="devolver algo"></mutation></block></value></block></statement></block><block type="procedures_defreturnsimple" id="cf1" x="29" y="153"><mutation statements="false"></mutation><field name="NAME">devolver algo</field><value name="RETURN"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value></block></xml>',
    `/*@BEGIN_REGION@cf1@*/
function devolverAlgo() {
  return (/*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/)
}
/*@END_REGION@*/


/*@BEGIN_REGION@program@*/
program {
  /*@BEGIN_REGION@poner@*/
  Poner(/*@BEGIN_REGION@f1@*/devolverAlgo()/*@END_REGION@*/)
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
  true);

  gsTestCode('Función pura parametrizada',
  '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="procedures_defreturnsimplewithparams" id="f1" x="75" y="25"><mutation statements="false"><arg name="x"></arg></mutation><field name="NAME">doble</field><value name="RETURN"><block type="OperadorNumerico" id="plus"><field name="OPERATOR">+</field><value name="arg1"><block type="variables_get" id="x"><mutation var="x"></mutation></block></value><value name="arg2"><block type="variables_get" id="x2"><mutation var="x"></mutation></block></value></block></value></block><block type="Program" id="program" deletable="false" x="44" y="155"><mutation timestamp="1509516775623"></mutation><statement name="program"><block type="RepeticionSimple" id="repeat"><value name="count"><block type="procedures_callreturnsimplewithparams" id="cf1"><mutation name="doble"><arg name="x"></arg></mutation><value name="ARG0"><block type="math_number" id="2"><field name="NUM">2</field></block></value></block></value><statement name="block"><block type="Poner" id="poner"><value name="COLOR"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value></block></statement></block></statement></block></xml>',
    `/*@BEGIN_REGION@f1@*/
function doble(x) {
  return (/*@BEGIN_REGION@plus@*//*@BEGIN_REGION@x@*/x/*@END_REGION@*/ + /*@BEGIN_REGION@x2@*/x/*@END_REGION@*//*@END_REGION@*/)
}
/*@END_REGION@*/


/*@BEGIN_REGION@program@*/
program {
  /*@BEGIN_REGION@repeat@*/
  repeat(/*@BEGIN_REGION@cf1@*/doble(/*@BEGIN_REGION@2@*/2/*@END_REGION@*/)/*@END_REGION@*/) {
    /*@BEGIN_REGION@poner@*/
    Poner(/*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/)
    /*@END_REGION@*/
  }
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('AlternativaSimple',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Program" deletable="false" movable="false" editable="false" x="30" y="30" id="prog"><statement name="program"><block type="AlternativaSimple" id="if"><value name="condicion"><block type="BoolSelector" id="true"><field name="BoolDropdown">True</field></block></value><statement name="block"><block type="Poner" id="poner"><value name="COLOR"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value></block></statement></block></statement></block></xml>',
    `/*@BEGIN_REGION@prog@*/
program {
  /*@BEGIN_REGION@if@*/
  if (/*@BEGIN_REGION@true@*/True/*@END_REGION@*/) {
    /*@BEGIN_REGION@poner@*/
    Poner(/*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/)
    /*@END_REGION@*/
  }
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('AlternativaCompleta',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="Program" id="program" deletable="false" movable="false" editable="false" x="30" y="30"><mutation timestamp="1510689378113"></mutation><statement name="program"><block type="AlternativaCompleta" id="if"><mutation else="1"></mutation><value name="condicion"><block type="BoolSelector" id="true"><field name="BoolDropdown">True</field></block></value><statement name="block1"><block type="Poner" id="poner"><value name="COLOR"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value></block></statement><statement name="block2"><block type="Sacar" id="sacar"><value name="COLOR"><block type="ColorSelector" id="verde"><field name="ColorDropdown">Verde</field></block></value></block></statement></block></statement></block></xml>',
    `/*@BEGIN_REGION@program@*/
program {
  /*@BEGIN_REGION@if@*/
  if (/*@BEGIN_REGION@true@*/True/*@END_REGION@*/) {
    /*@BEGIN_REGION@poner@*/
    Poner(/*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/)
    /*@END_REGION@*/
  } else {
    /*@BEGIN_REGION@sacar@*/
    Sacar(/*@BEGIN_REGION@verde@*/Verde/*@END_REGION@*/)
    /*@END_REGION@*/
  }
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('AlternativaCompletaConElseIf',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="Program" id="program" deletable="false" x="30" y="30"><mutation timestamp="1510202309441"></mutation><statement name="program"><block type="AlternativaCompleta" id="if"><mutation elseif="2" else="1"></mutation><value name="condicion"><block type="puedeMover" id="puedeMover1"><value name="VALUE"><block type="DireccionSelector" id="este1"><field name="DireccionDropdown">Este</field></block></value></block></value><statement name="block1"><block type="Poner" id="poner1"><value name="COLOR"><block type="ColorSelector" id="rojo1"><field name="ColorDropdown">Rojo</field></block></value></block></statement><value name="IF1"><block type="puedeMover" id="puedeMover2"><value name="VALUE"><block type="DireccionSelector" id="oeste2"><field name="DireccionDropdown">Oeste</field></block></value></block></value><statement name="DO1"><block type="Sacar" id="sacar"><value name="COLOR"><block type="ColorSelector" id="rojo2"><field name="ColorDropdown">Rojo</field></block></value></block></statement><value name="IF2"><block type="puedeMover" id="puedeMover3"><value name="VALUE"><block type="DireccionSelector" id="sur3"><field name="DireccionDropdown">Sur</field></block></value></block></value><statement name="block2"><block type="Mover" id="mover3"><value name="DIRECCION"><block type="DireccionSelector" id="este3"><field name="DireccionDropdown">Este</field></block></value></block></statement></block></statement></block></xml>',
    `/*@BEGIN_REGION@program@*/
program {
  /*@BEGIN_REGION@if@*/
  if (/*@BEGIN_REGION@puedeMover1@*/puedeMover(/*@BEGIN_REGION@este1@*/Este/*@END_REGION@*/)/*@END_REGION@*/) {
    /*@BEGIN_REGION@poner1@*/
    Poner(/*@BEGIN_REGION@rojo1@*/Rojo/*@END_REGION@*/)
    /*@END_REGION@*/
  } elseif (/*@BEGIN_REGION@puedeMover2@*/puedeMover(/*@BEGIN_REGION@oeste2@*/Oeste/*@END_REGION@*/)/*@END_REGION@*/) {
    /*@BEGIN_REGION@sacar@*/
    Sacar(/*@BEGIN_REGION@rojo2@*/Rojo/*@END_REGION@*/)
    /*@END_REGION@*/
  } elseif (/*@BEGIN_REGION@puedeMover3@*/puedeMover(/*@BEGIN_REGION@sur3@*/Sur/*@END_REGION@*/)/*@END_REGION@*/) {
  } else {
    /*@BEGIN_REGION@mover3@*/
    Mover(/*@BEGIN_REGION@este3@*/Este/*@END_REGION@*/)
    /*@END_REGION@*/
  }
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('Repetición Simple',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Program" deletable="false" movable="false" editable="false" x="30" y="30" id="prog"><statement name="program"><block type="RepeticionSimple" id="repeat"><value name="count"><block type="math_number" id="5"><field name="NUM">5</field></block></value><statement name="block"><block type="Mover" id="mover"><value name="DIRECCION"><block type="DireccionSelector" id="este"><field name="DireccionDropdown">Este</field></block></value></block></statement></block></statement></block></xml>',
    `/*@BEGIN_REGION@prog@*/
program {
  /*@BEGIN_REGION@repeat@*/
  repeat(/*@BEGIN_REGION@5@*/5/*@END_REGION@*/) {
    /*@BEGIN_REGION@mover@*/
    Mover(/*@BEGIN_REGION@este@*/Este/*@END_REGION@*/)
    /*@END_REGION@*/
  }
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('Llamada a procedimiento',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="Program" deletable="false" movable="false" editable="false" id="prog"><statement name="program"><block type="procedures_callnoreturn" id="f1call"><mutation name="hacer algo con"><arg name="x"></arg><arg name="y"></arg></mutation><value name="ARG0"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value><value name="ARG1"><block type="ColorSelector" id="verde"><field name="ColorDropdown">Verde</field></block></value></block></statement></block><block type="procedures_defnoreturn" id="f1def"><mutation><arg name="x"></arg><arg name="y"></arg></mutation><field name="NAME">hacer algo con</field><comment></comment></block></xml>',
    `/*@BEGIN_REGION@f1def@*/
procedure HacerAlgoCon(x, y) {
}
/*@END_REGION@*/


/*@BEGIN_REGION@prog@*/
program {
  /*@BEGIN_REGION@f1call@*/
  HacerAlgoCon(/*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/, /*@BEGIN_REGION@verde@*/Verde/*@END_REGION@*/)
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('Genera bien varios comandos seguidos',
    `<xml xmlns="http://www.w3.org/1999/xhtml">
    <variables>
    </variables>
    <block type="Program" id="p1" deletable="false" x="30" y="30">
      <mutation timestamp="1514515892649">
      </mutation>
      <statement name="program">
        <block type="VaciarTablero" id="v1">
          <next>
            <block type="VaciarTablero" id="v2">
              <next>
                <block type="VaciarTablero" id="v3">
                </block>
              </next>
            </block>
          </next>
        </block>
      </statement>
    </block>
  </xml>
  `,
    `/*@BEGIN_REGION@p1@*/
program {
  /*@BEGIN_REGION@v1@*/
  VaciarTablero()
  /*@END_REGION@*/
  /*@BEGIN_REGION@v2@*/
  VaciarTablero()
  /*@END_REGION@*/
  /*@BEGIN_REGION@v3@*/
  VaciarTablero()
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
  true);

    gsTestCode('Asignacion variable',
      '<xml><block type="Program" id="prog"><statement name="program"><block type="Asignacion" id="asig"><field name="varName">x</field><value name="varValue"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value><next><block type="Poner" id="poner"><value name="COLOR"><block type="variables_get" id="vget"><mutation var="x"></mutation></block></value></block></next></block></statement></block></xml>',
      `/*@BEGIN_REGION@prog@*/
program {
  /*@BEGIN_REGION@asig@*/
  x := /*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/
  /*@END_REGION@*/
  /*@BEGIN_REGION@poner@*/
  Poner(/*@BEGIN_REGION@vget@*/x/*@END_REGION@*/)
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('Programa interactivo simple',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="InteractiveProgram" id="iprog" deletable="false" x="-7" y="25"><mutation timestamp="1509521036701"></mutation><statement name="interactiveprogram"><block type="InteractiveKeyBinding" id="kb1"><mutation modifierscount="0"></mutation><field name="InteractiveBindingDropdownKey">ARROW_LEFT</field><statement name="block"><block type="Poner" id="poner1"><value name="COLOR"><block type="ColorSelector" id="rojo1"><field name="ColorDropdown">Rojo</field></block></value></block></statement><next><block type="InteractiveLetterBinding" id="kb2"><mutation modifierscount="3"></mutation><field name="InteractiveBindingDropdownKey">A</field><field name="d1">SHIFT</field><field name="d2">CTRL</field><field name="d3">ALT</field><statement name="block"><block type="Poner" id="poner2"><value name="COLOR"><block type="ColorSelector" id="verde2"><field name="ColorDropdown">Verde</field></block></value></block></statement><next><block type="InteractiveNumberBinding" id="kb3"><mutation modifierscount="2"></mutation><field name="InteractiveBindingDropdownKey">1</field><field name="d1">CTRL</field><field name="d2">SHIFT</field><statement name="block"><block type="Poner" id="poner3"><value name="COLOR"><block type="ColorSelector" id="azul3"><field name="ColorDropdown">Azul</field></block></value></block></statement></block></next></block></next></block></statement></block></xml>',
    `/*@BEGIN_REGION@iprog@*/
interactive program {
  /*@BEGIN_REGION@kb1@*/
  K_ARROW_LEFT -> {
    /*@BEGIN_REGION@poner1@*/
    Poner(/*@BEGIN_REGION@rojo1@*/Rojo/*@END_REGION@*/)
    /*@END_REGION@*/
  }
  /*@END_REGION@*/
  /*@BEGIN_REGION@kb2@*/
  K_CTRL_ALT_SHIFT_A -> {
    /*@BEGIN_REGION@poner2@*/
    Poner(/*@BEGIN_REGION@verde2@*/Verde/*@END_REGION@*/)
    /*@END_REGION@*/
  }
  /*@END_REGION@*/
  /*@BEGIN_REGION@kb3@*/
  K_CTRL_SHIFT_1 -> {
    /*@BEGIN_REGION@poner3@*/
    Poner(/*@BEGIN_REGION@azul3@*/Azul/*@END_REGION@*/)
    /*@END_REGION@*/
  }
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('Programa interactivo con init y timeout',
    '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="InteractiveProgram" id="iprogram" deletable="false" x="67" y="8"><mutation init="true" timeout="500" timestamp="1509521133888"></mutation><statement name="interactiveprogram"><block type="InteractiveKeyBinding" id="kb1"><mutation modifierscount="0"></mutation><field name="InteractiveBindingDropdownKey">TAB</field><statement name="block"><block type="Poner" id="poner1"><value name="COLOR"><block type="ColorSelector" id="negro1"><field name="ColorDropdown">Negro</field></block></value></block></statement></block></statement><statement name="init"><block type="Poner" id="poner2"><value name="COLOR"><block type="ColorSelector" id="rojo2"><field name="ColorDropdown">Rojo</field></block></value></block></statement><statement name="timeout"><block type="Poner" id="poner3"><value name="COLOR"><block type="ColorSelector" id="verde3"><field name="ColorDropdown">Verde</field></block></value></block></statement></block></xml>',
    `/*@BEGIN_REGION@iprogram@*/
interactive program {
  INIT -> {
  /*@BEGIN_REGION@poner2@*/
  Poner(/*@BEGIN_REGION@rojo2@*/Rojo/*@END_REGION@*/)
  /*@END_REGION@*/
  }
  /*@BEGIN_REGION@kb1@*/
  K_TAB -> {
    /*@BEGIN_REGION@poner1@*/
    Poner(/*@BEGIN_REGION@negro1@*/Negro/*@END_REGION@*/)
    /*@END_REGION@*/
  }
  /*@END_REGION@*/
  TIMEOUT(500) -> {
  /*@BEGIN_REGION@poner3@*/
  Poner(/*@BEGIN_REGION@verde3@*/Verde/*@END_REGION@*/)
  /*@END_REGION@*/
  }
}
/*@END_REGION@*/\n`,
true);

  gsTestCode('Comando Completar',
      '<xml><block type="Program" id="completar"><statement name="program"><block type="ComandoCompletar" id="comp"><next><block type="Poner" id="poner"><value name="COLOR"><block type="ColorSelector" id="rojo"><field name="ColorDropdown">Rojo</field></block></value></block></next></block></statement></block></xml>',
      `/*@BEGIN_REGION@completar@*/
program {
  /*@BEGIN_REGION@comp@*/
  BOOM("El programa todavía no está completo")
  /*@END_REGION@*/
  /*@BEGIN_REGION@poner@*/
  Poner(/*@BEGIN_REGION@rojo@*/Rojo/*@END_REGION@*/)
  /*@END_REGION@*/
}
/*@END_REGION@*/\n`,
true);

});
