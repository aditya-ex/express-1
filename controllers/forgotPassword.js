const User = require("../models/User");
const resetToken = require("../models/resetToken");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("user doesn't exist");
    let token = await resetToken.findOne({ userId: user._id });
    if (!token) {
      token = await new resetToken({
        userId: user._id,
        token: jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
          expiresIn: "600",
        }),
      }).save();
    }
    res.send(token);
  } catch (err) {
    res.send("an err occured");
    console.log(err);
  }
};
module.exports = { forgotPassword };
