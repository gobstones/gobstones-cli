
//-----------
// Getters --
//-----------

// function get(key, object) {
//   if (object === undefined) throw new Error("undefined object, when asking for key " + key)
//   if (key === undefined) throw new Error("undefined key")
//   return object[key]
// }

// function getJust(key, object) {
//   var value = get(key, object);
//   if (value === undefined) {
//     throw new Error("value not present");
//   }
//   return value;
// }

// function getWith(f, key, object) {
//   return f(getJust(key, object));
// }

// function getArrayWith(f, key, object) {
//   return getWith(it => parseArray(f, it), key, object);
// }

// function getString(key, object) {
//   return getStringWith((x) => x, key, object);
// }

// function getStringWith(f, key, object) {
//   function ensureString(s) {
//     if (typeof s !== 'string') {
//       throw new Error("value is not an string");
//     }
//     return f(s);
//   }
//   return getWith(ensureString, key, object);
// }

// function getExpression(key, object) {
//   return getWith(parseExpression, key, object);
// }

// function getBody(key, object) {
//   return getWith(parse, key, object);
// }


//-----------------
// S-expressions --
//-----------------

function s(tag, contents) {
  if (tag === "Sequence" && contents.length === 1) {
    return contents[0];
  }

  if (tag === "Sequence" && contents.length === 0) {
    return { tag: "MuNull" };
  }

  if (Array.isArray(contents) && contents.length === 1) {
    return { tag: tag, contents: contents[0] };
  }

  if (contents !== undefined) {
    return { tag: tag, contents: contents };
  }

  return { tag: tag };
}

//------------------
// Error Handling --
//------------------

function unmatched(v) {
  throw new Error("unmatched value: " + JSON.stringify(v));
}

//-----------------
// Actual Parser --
//-----------------

function parse(body) {
  // TODO: Terminar y borrar lo que no se use
  // if (Array.isArray(body)) {
  //   return s("Sequence", parseArray(parseKeyword1, body))
  // }
  // if (body === null) {
  //   return s("MuNull");
  // }

  if (Array.isArray(body)) {
    return parseArray(parse, body)
  }

  if (typeof body === "string") {
    return parseValue(body);
  }

  if (typeof body === "object") {
    return parseNode(body);
  }

  unmatched(body);
}

function parseArray(f, array) {
  return array.map(f);
}

// function parseCaseValue(o) {
//   return [getExpression("case", o), getBody("body", o)];
// }

// function parseParameter(o) {
//   return s("VariablePattern", getString("value", o));
// }

// function parseFunctionCall(o) {
//   return parseNode("ProcedureCall", o);
// }

// function parseLiteral(o) {
//   function f(kind, value) {
//     if (kind === "NumericLiteral")  return s("MuNumber", value);
//     if (typeof value === 'boolean') return s("MuBool", value);
//     if (typeof value === 'number')  return s("MuSymbol", parseColor(value));
//     if (typeof value === 'string')  return s("Reference", value);
//     if (Array.isArray(value))       return s("MuSymbol", parseDirection(value));
//     unmatched(o)
//   }
//   return f(get("alias",o), getJust("value", o));
// }

// function parseDirection(direction) {
//   function f(x, y) {
//     if (x === 1 && y === 0)  return "Este";
//     if (x === 0 && y === 1)  return "Norte";
//     if (x === -1 && y === 0) return "Oeste";
//     if (x === 0 && y === -1) return "Sur";
//     unmatched(direction)
//   }
//   return f(direction[0], direction[1]);
// }

// function parseColor(color) {
//   return ["Azul", "Rojo", "Negro", "Verde"][color];
// }

// function parseBinary(o) {
//   return simpleApplication(
//           getStringWith(parseFunction, "alias", o),
//           [getExpression("left", o), getExpression("right", o)]);
// }

// function parseNot(o) {
//   return simpleApplication(
//           getStringWith(parseFunction, "alias", o),
//           [getExpression("expression", o)]);
// }

// function parseFunction(name) {
//   if (name === "EqOperation")           return s("Equal");
//   if (name === "NotEqualOperation")     return s("NotEqual");
//   if (name === "AndOperation")          return s("Reference", "&&");
//   if (name === "OrOperation")           return s("Reference", "||");
//   if (name === "LessEqualOperation")    return s("Reference", "<=");
//   if (name === "LessOperation")         return s("Reference", "<");
//   if (name === "GraterOperation")       return s("Reference", ">");
//   if (name === "GreaterEqualOperation") return s("Reference", ">=");
//   return s("Reference", name);
// }

// function parseExpression(o) {
//   if (get("name", o) !== undefined) return parseFunctionCall(o);
//   if (get("arity", o) === "binary") return parseBinary(o);
//   if (get("alias", o) === "not")    return parseNot(o);
//   return parseLiteral(o);
// }

// function parseReturn(o) {
//   return getExpression("expression", o);
// }

// function parseKeyword1(o) {
//   return parseNode(getJust("alias", o), o);
// }

function parseNode(node) {
  var contents = node.contents;

  switch (node.tag) {
    case "N_Main":
    case "N_StmtBlock":
      return s("Sequence", parse(contents));
    case "N_DefProgram":
      return s("EntryPoint", ["program"].concat(parse(contents)));
    case "N_DefProcedure":
      {
        var name = getIdentifierValue(contents[0]);
        var parameters = parseArray(parseParameter, contents[1]);
        var body = parse(contents[2]);
        return simpleCallable("Procedure", name, parameters, body);
      }
    case "N_StmtAssignVariable":
      {
        var id = getIdentifierValue(contents[0]);
        var value = contents[1];
        return s("Assignment", [id, parse(value)]);
      }
    case "N_ExprFunctionCall":
    case "N_StmtProcedureCall":
      return s("Application", parse(contents));
    case "N_StmtReturn":
      return s("Return", parse(contents));
    case "N_ExprVariable":
      return parseValue(contents[0]);
    case "N_ExprConstantNumber":
      return s("MuNumber", parseInt(getIdentifierValue(contents[0])))
    default:
      console.log("NO ENCONTRÉ", node);
      return "nosenose"; // TODO: Borrar
      //unmatched(node);
  }
  // if (key === "program")              return s("EntryPoint", ["program", parseProgramBody(o)]);
  // if (key === "procedureDeclaration") return simpleCallable("Procedure",
  //                                             getString("name", o),
  //                                             getArrayWith(parseParameter, "parameters", o),
  //                                             getBody("body", o));
  // if (key === "functionDeclaration")  return simpleCallable("Function",
  //                                             getString("name", o),
  //                                             getArrayWith(parseParameter, "parameters", o),
  //                                             addReturn(getBody("body", o), getWith(parseReturn, "return", o)));
  // if (key === "ProcedureCall")        return simpleApplication(
  //                                         getStringWith(parseFunction,"name",o),
  //                                         getArrayWith(parseExpression, "parameters", o));
  // if (key === ":=" )                  return s("Assignment", [getWith((x) => getString("value", x), "left", o), getExpression("right", o)]);
  // if (key === "if")                   return s("If",[
  //                                             getExpression("condition", o),
  //                                             getBody("trueBranch", o),
  //                                             getBody("falseBranch", o)]);
  // if (key === "while")                return parseRepeat("While", o);
  // if (key === "repeat")               return parseRepeat("Repeat", o);
  // if (key === "switch")               return s("Switch", [getExpression("expression", o), getArrayWith(parseCaseValue, "cases", o)]);
  // if (key === "return")               return s("Return", getExpression("expression", o));
  // if (key === "Drop")                 return parsePrimitive("Poner", o);
  // if (key === "Grab")                 return parsePrimitive("Sacar", o);
  // if (key === "MoveClaw")             return parsePrimitive("Mover", o);
  // if (key === "hasStones")            return parsePrimitive("hayBolitas", o);
  // if (key === "canMove")              return parsePrimitive("puedeMover", o);
  // unmatched(o);
}

function parseValue(string, type = "Reference") {
  // var type = string.split("(")[0];
  // var value = getIdentifierValue(string);

  // switch (type) {
  //   case "LOWERID":
  //   case "UPPERID":
      return s(type, getIdentifierValue(string));
    // case "NUM":
    //   return s("MuNumber", parseInt(value));
  // }
}

function parseParameter(string) {
  return s("VariablePattern", getIdentifierValue(string));
}

// function parseProgramBody(o) {
//   return addReturn(
//     getBody("body", o),
//     (fmap(parseReturn, get("returnSentence", o)) || s("MuNull")));
// }

// function fmap(f, v) {
//   if (v !== undefined) {
//     return f(v);
//   }
// }

// function parsePrimitive(name, value) {
//   return simpleApplication(parseFunction(name), getArrayWith(parseExpression, "parameters", value));
// }

// function parseRepeat(kind, o) {
//   return s(kind, [getExpression("expression", o), getBody("body", o)])
// }

function getIdentifierValue(id) {
  return id.replace(/(^\w+\(")|("\)$)/g, "");
}

//---------------------------
//-- Expression Transforms --
//---------------------------

// function addReturn(body, returned) {
//   if (returned.tag === "MuNull") return body;
//   if (body.tag === "MuNull")     return s("Return", returned);
//   if (body.tag === "Sequence")   return s("Sequence", body.contents.concat([s("Return", returned)]))
//   return s("Sequence", [body, s("Return", returned)])
// }

//------------------
//-- Constructors --
//------------------

function simpleCallable(kind, name, parameters, body) {
  return s(kind, [name, [[parameters, s("UnguardedBody", body)]]]);
}

function simpleApplication(callable, args) {
  return s("Application", [callable, args]);
}

function reference(name) {
  return s("Reference", name);
}

//-------------
//-- Exports --
//-------------

module.exports = {
  parse: parse,
  s: s,
  callable: simpleCallable,
  reference: reference
};
