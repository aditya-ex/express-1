const User = require("../models/User");
const Token = require("../models/access_token");
const resetToken = require("../models/resetToken");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");

const resetPassword = async (req, res) => {
  try {
    const headerToken = await Token.findOne({
      token: req.headers.access_token,
    });
    const user = await User.findById({ _id: headerToken.userId });
    if (!user) return res.status(400).send("invalid user");

    const token = await resetToken.findOne({
      userId: user._id,
      token: req.params.password_reset_token,
    });
    if (!token) return res.status(400).send("invalid token");
    let password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    await token.delete();
    await sendEmail(user.sendEmail, "password reset successful");
    res.send("password reset done");
  } catch (err) {
    res.send("an error occured");
    console.log(err);
  }
};
module.exports = { resetPassword };
