
//-----------
// Getters --
//-----------

function get(key, object) {
  if (object === undefined) throw new Error("undefined object, when asking for key " + key)
  if (key === undefined) throw new Error("undefined key")
  return object[key]
}

function getJust(key, object) {
  var value = get(key, object);
  if (value === undefined) {
    throw new Error("value not present");
  }
  return value;
}

function getWith(f, key, object) {
  return f(getJust(key, object));
}

function getArrayWith(f, key, object) {
  return getWith(it => parseArray(f, it), key, object);
}

function getString(key, object) {
  return getStringWith((x) => x, key, object);
}

function getStringWith(f, key, object) {
  function ensureString(s) {
    if (typeof s !== 'string') {
      throw new Error("value is not an string");
    }
    return f(s);
  }
  return getWith(ensureString, key, object);
}

function getExpression(key, object) {
  return getWith(parseExpression, key, object);
}

function getBody(key, object) {
  return getWith(parseBody, key, object);
}


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

function parseBody(body) {
  if (Array.isArray(body)) {
    return s("Sequence", parseArray(parseKeyword1, body))
  }
  if (body === null) {
    return s("MuNull");
  }
  if (typeof body === 'object') {
    return parseKeyword1(body);
  }
  unmatched(body);
}

function parseArray(f, array) {
  return array.map(f);
}

function parseCaseValue(o) {
  return [getExpression("case", o), getBody("body", o)];
}

function parseParameter(o) {
  return s("VariablePattern", getString("value", o));
}

function parseFunctionCall(o) {
  return parseKeyword("ProcedureCall", o);
}

function parseLiteral(o) {
  function f(kind, value) {
    if (kind === "NumericLiteral")  return s("MuNumber", value);
    if (typeof value === 'boolean') return s("MuBool", value);
    if (typeof value === 'number')  return s("MuSymbol", parseColor(value));
    if (typeof value === 'string')  return s("Reference", value);
    if (Array.isArray(value))       return s("MuSymbol", parseDirection(value));
    unmatched(o)
  }
  return f(get("alias",o), getJust("value", o));
}

function parseDirection(direction) {
  function f(x, y) {
    if (x === 1 && y === 0)  return "Este";
    if (x === 0 && y === 1)  return "Norte";
    if (x === -1 && y === 0) return "Oeste";
    if (x === 0 && y === -1) return "Sur";
    unmatched(direction)
  }
  return f(direction[0], direction[1]);
}

function parseColor(color) {
  return ["Azul", "Rojo", "Negro", "Verde"][color];
}

function parseBinary(o) {
  return simpleApplication(
          getStringWith(parseFunction, "alias", o),
          [getExpression("left", o), getExpression("right", o)]);
}

function parseNot(o) {
  return simpleApplication(
          getStringWith(parseFunction, "alias", o),
          [getExpression("expression", o)]);
}

function parseFunction(name) {
  if (name === "EqOperation")           return s("Equal");
  if (name === "NotEqualOperation")     return s("NotEqual");
  if (name === "AndOperation")          return s("Reference", "&&");
  if (name === "OrOperation")           return s("Reference", "||");
  if (name === "LessEqualOperation")    return s("Reference", "<=");
  if (name === "LessOperation")         return s("Reference", "<");
  if (name === "GraterOperation")       return s("Reference", ">");
  if (name === "GreaterEqualOperation") return s("Reference", ">=");
  return s("Reference", name);
}

function parseExpression(o) {
  if (get("name", o) !== undefined) return parseFunctionCall(o);
  if (get("arity", o) === "binary") return parseBinary(o);
  if (get("alias", o) === "not")    return parseNot(o);
  return parseLiteral(o);
}

function parseReturn(o) {
  return getExpression("expression", o);
}

function parseKeyword1(o) {
  return parseKeyword(getJust("alias", o), o);
}

function parseKeyword(key, o) {
  if (key === "program")              return s("EntryPoint", ["program", parseProgramBody(o)]);
  if (key === "procedureDeclaration") return simpleCallable("Procedure",
                                              getString("name", o),
                                              getArrayWith(parseParameter, "parameters", o),
                                              getBody("body", o));
  if (key === "functionDeclaration")  return simpleCallable("Function",
                                              getString("name", o),
                                              getArrayWith(parseParameter, "parameters", o),
                                              addReturn(getBody("body", o), getWith(parseReturn, "return", o)));
  if (key === "ProcedureCall")        return simpleApplication(
                                          getStringWith(parseFunction,"name",o),
                                          getArrayWith(parseExpression, "parameters", o));
  if (key === ":=" )                  return s("Assignment", [getWith((x) => getString("value", x), "left", o), getExpression("right", o)]);
  if (key === "if")                   return s("If",[
                                              getExpression("condition", o),
                                              getBody("trueBranch", o),
                                              getBody("falseBranch", o)]);
  if (key === "while")                return parseRepeat("While", o);
  if (key === "repeat")               return parseRepeat("Repeat", o);
  if (key === "switch")               return s("Switch", [getExpression("expression", o), getArrayWith(parseCaseValue, "cases", o)]);
  if (key === "return")               return s("Return", getExpression("expression", o));
  if (key === "Drop")                 return parsePrimitive("Poner", o);
  if (key === "Grab")                 return parsePrimitive("Sacar", o);
  if (key === "MoveClaw")             return parsePrimitive("Mover", o);
  if (key === "hasStones")            return parsePrimitive("hayBolitas", o);
  if (key === "canMove")              return parsePrimitive("puedeMover", o);
  unmatched(o);
}


function parseProgramBody(o) {
  return addReturn(
    getBody("body", o),
    (fmap(parseReturn, get("returnSentence", o)) || s("MuNull")));
}

function fmap(f, v) {
  if (v !== undefined) {
    return f(v);
  }
}

function parsePrimitive(name, value) {
  return simpleApplication(parseFunction(name), getArrayWith(parseExpression, "parameters", value));
}

function parseRepeat(kind, o) {
  return s(kind, [getExpression("expression", o), getBody("body", o)])
}

//---------------------------
//-- Expression Transforms --
//---------------------------

function addReturn(body, returned) {
  if (returned.tag === "MuNull") return body;
  if (body.tag === "MuNull")     return s("Return", returned);
  if (body.tag === "Sequence")   return s("Sequence", body.contents.concat([s("Return", returned)]))
  return s("Sequence", [body, s("Return", returned)])
}

//------------------
//-- Constructors --
//------------------


function simpleCallable(kind, name, parameters, body) {
  return s(kind, [name, [[parameters, s("UnguardedBody", body)]]]);
}

function simpleApplication(callable, args) {
  return s("Application", [callable, args]);
}

//-------------
//-- Exports --
//-------------

module.exports = {
  parse: parseBody,
  s: s,
  callable: simpleCallable
};
