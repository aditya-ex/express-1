const Token = require("../models/token");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authentication = async (req, res, next) => {
  let token = req.headers.access_token;
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, async function (err, decoded) {
      if (err) {
        return res.send(err);
      } else {
        const token = await Token.findOne({ token: req.headers.access_token });
        const user = await User.findById({ _id: token.userId });
        req.user = user;
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: "No token provided.",
    });
  }
};

module.exports = authentication;
