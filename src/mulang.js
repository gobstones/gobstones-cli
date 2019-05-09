const _ = require("lodash");

//-----------------
// S-expressions --
//-----------------

function s(tag, contents) {
  if (tag === "Sequence" && contents.length === 1) {
    return contents[0];
  }

  if (tag === "Sequence" && contents.length === 0) {
    return { tag: "None" };
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

function other(v) {
    return { tag: "Other", contents: [JSON.stringify(v), s("None")] };
}

//-----------------
// Actual Parser --
//-----------------

function parse(body) {
  if ("" + body === "null") {
    return s("None");
  }

  if (Array.isArray(body)) {
    return parseArray(parse, body)
  }

  if (typeof body === "string") {
    return parseValue(body);
  }

  if (typeof body === "object") {
    return parseNode(body);
  }

  return other(body);
}

function parseArray(f, array) {
  return array.map(f);
}

function parseNode(node) {
  var contents = node.contents;

  switch (node.tag) {
    case "N_Main":
    case "N_StmtBlock":
      return s("Sequence", parse(contents));

    case "N_DefProgram":
      return entryPointTag("program", parse(contents));

    case "N_DefInteractiveProgram":
      return parseInteractiveProgram(contents);

    case "N_DefFunction":
      return parseDeclaration("Function", contents);

    case "N_DefProcedure":
      return parseDeclaration("Procedure", contents);

    case "N_StmtReturn":
      return s("Return", parse(contents));

    case "N_StmtProcedureCall":
    case "N_ExprFunctionCall":
      return s("Application", parse(contents));

    case "N_StmtAssignVariable":
      return parseAssignment(contents);

    case "N_StmtIf":
      return s("If", parse(contents));

    case "N_StmtWhile":
      return s("While", parse(contents));

    case "N_StmtRepeat":
      return s("Repeat", parse(contents));

    case "N_StmtSwitch":
      return parseSwitch(contents);

    case "N_ExprVariable":
      return parseValue(contents[0]);

    case "N_ExprConstantString":
      return s("MuString", getString(contents[0]));

    case "N_PatternNumber":
    case "N_ExprConstantNumber":
      return s("MuNumber", parseInt(getString(contents[0])));

    case "N_ExprStructure":
    case "N_PatternStructure":
      return parseLiteral(contents[0]);

    case "N_PatternWildcard":
      return reference("_");

    default:
      return other(node);
  }
}

function parseAssignment(contents) {
  var id = getString(contents[0]);
  var value = contents[1];
  return s("Assignment", [id, parse(value)]);
}

function parseDeclaration(kind, contents) {
  var name = getString(contents[0]);
  var parameters = parseArray(parseParameter, contents[1]);
  var body = parse(contents[2]);

  return callable(kind, name, parameters, body);
}

function parseInteractiveProgram(contents) {
  const interactiveProgramContents = parseInteractiveProgramContents(contents);
  return entryPointTag("interactiveProgram", interactiveProgramContents);
}

function parseInteractiveProgramContents(contents) {
  const branches = parseArray(parseSwitchBranch, contents);
  const interactiveProgramContents = branches.map((branch) => {
    const keyBinding = toListenerName(branch[0].contents);
    return entryPointTag(keyBinding, branch[1]);
  });
  return s("Sequence", interactiveProgramContents);
}

function toListenerName(key) {
  return _.camelCase(`ON_${key}_PRESSED`)
}

function parseParameter(string) {
  return s("VariablePattern", getString(string));
}

function parseSwitch(contents) {
  var value = parse(contents[0]);
  var branches = parseArray(parseSwitchBranch, contents[1]);
  return switchTag(value, branches);
}

function switchTag(value, branches) {
  return s("Switch", [value, branches, s("None")])
}

function entryPointTag(name, contents) {
  return s("EntryPoint", [name].concat(contents));
}

function parseSwitchBranch(node) {
  if (node.tag !== "N_SwitchBranch") unmatched(node);
  var contents = node.contents;

  return parse(contents);
}

function parseValue(string) {
  var value = getString(string);

  switch (value) {
    case "==":
      return s("Equal")
    case "/=":
      return s("NotEqual")
    default:
      return reference(value);
  }
}

function parseLiteral(id) {
  var value = getString(id);

  if (value === "True" || value === "False")
    return s("MuBool", value === "True");

  return s("MuSymbol", value);
}

function getString(id) {
  return id.replace(/(^\w+\(")|("\)$)/g, "");
}

//------------------
//-- Constructors --
//------------------

function callable(kind, name, parameters, body) {
  return s(kind, [name, [[parameters, s("UnguardedBody", body)]]]);
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
  callable: callable,
  reference: reference
};
