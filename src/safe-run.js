module.exports = function(action, onError) {
  try {
    return action()
  } catch (err) {
    var error = (err.status) ? err : {
      status: "all_is_broken_error",
      message: "Something has gone very wrong",
      detail: err,
      moreDetail: err.message
    };

    if (onError) onError(error);
    return error;
  }
};
