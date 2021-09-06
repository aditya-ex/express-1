const Token = require("../models/access_token");

const checkObjectId = (req, res, next) => {
  const token = req.headers.access_token;
  let headerToken = Token.findOne({ token: token });
  if (!headerToken) {
    let error = new Error("Not authorized");
    error.status = 401;
    return next(error);
  } else {
    return next();
  }
};

module.exports = checkObjectId;
