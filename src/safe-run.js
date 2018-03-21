makeError = require("./make-error");

module.exports = function(action, onError) {
  try {
    return action()
  } catch (err) {
    var error = makeError(err);

    if (onError) onError(error);
    return error;
  }
};
