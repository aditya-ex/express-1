const Token = require("../models/token");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authentication = async (req, res, next) => {
  let headerToken = req.headers.access_token;
  if (headerToken) {
    try {
      await jwt.verify(headerToken, process.env.SECRET_KEY);
      const token = await Token.findOne({ token: headerToken });
      const user = await User.findById({ _id: token.userId });
      req.user = user;
      next();
    } catch (err) {
      res.send({
        error: 1,
        message: err.message || "an error occured",
        data: err,
      });
    }
  } else {
    return res.send({
      error: 1,
      message: "No token provided",
      data: [],
    });
  }
};

module.exports = authentication;
