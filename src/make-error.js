module.exports = function(err) {
  return (err.status) ? err : {
    status: "all_is_broken_error",
    message: "Something has gone very wrong",
    detail: err,
    moreDetail: err.message
  };
};
