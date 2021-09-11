const Token = require("../models/token");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authentication = async (req, res, next) => {
  let headerToken = await req.headers.access_token;
  if (headerToken) {
    try{
      jwt.verify(headerToken, process.env.SECRET_KEY);
      const token = await Token.findOne({ token: headerToken });
      const user = await User.findById({ _id: token.userId });
      req.user = user;
      next();
    }catch(err){
      res.send(err);
    }
  } else {
    return res.send("No token provided");
  }
};

module.exports = authentication;
