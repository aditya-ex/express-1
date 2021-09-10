const Token = require("../models/token");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authentication = async (req, res, next) => {
  let headerToken = req.headers.access_token;
  const token = await Token.findOne({ token: headerToken });
  const user = await User.findById({ _id: token.userId });
  const address = await Address.find({ user_id: token.userId });
  req.user = user;
  req.address = address;
  if (!headerToken) {
    res.send("token required");
  }
  try {
    let currentTime = Date.now().valueOf() /1000;
    if(typeof headerToken.exp !== 'undefined' && headerToken.exp < currentTime){
      res.send('token expired');
    }
  } catch (err) {
    res.send('Invalid Token');
  }
  return next();
};

module.exports = authentication;
