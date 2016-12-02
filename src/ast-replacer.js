module.exports = function(key,value) {
  if (key == "scope") return undefined;
  else if (key == "token") return undefined;
  else if (key == "interpret") return undefined;
  else if (key == "range") return undefined;
  else if (key == "eval") return undefined;
  else if (key == "type") return undefined;
  else return value;
};
