const User = require("../models/User");

const checkObjectId = (req, res, next) => {
  const token = req.headers.access_token;
  User.findById(token).exec(function (error, user) {
    if (!user) {
      let error = new Error("Not authorized");
      error.status = 401;
      return next(error);
    } else {
      return next();
    }
  });
};

module.exports = checkObjectId;
