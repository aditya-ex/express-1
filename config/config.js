const User = require("../models/User");
const checkObjectId = (access_token) => (req, res, next) => {
  User.findById(req.headers[access_token]).exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        let err = new Error("Not authorized");
        err.status = 401;
        return next(err);
      } else {
        return next();
      }
    }
  });
};

module.exports = checkObjectId;
