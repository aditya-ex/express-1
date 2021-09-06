const User = require("../models/User");
const Token = require("../models/access_token");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const login = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  if (user) {
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (validPassword) {
      let token = new Token();
      let access_token = jwt.sign(
        { userId: user._id },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      token.userId = user._id;
      token.token = access_token;
      let savedToken = await token.save();
      res.send(savedToken);
    } else {
      res.status(500).send("internal server error");
    }
  }
};

module.exports = { login };
