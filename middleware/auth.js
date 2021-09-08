const Token = require("../models/access_token");

const authentication = (req, res, next) => {
  const token = Token.findOne({ token: req.headers.access_token });
  if (!token) {
    let error = new Error("Not authorized");
    error.status = 401;
    return next(error);
  } else {
    return next();
  }
};

module.exports = authentication;
