const Token = require("../models/access_token");
const User = require("../models/User");

const deleteUser = async (req, res) => {
  try {
    const token = await Token.findOne({ token: req.headers.access_token });
    const userResult = await User.findById({ _id: token.userId });
    if (!userResult) {
      res.status(404).json({ msg: "user not found" });
    }
    await userResult.remove();
    res.send("user removed");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
};
module.exports = { deleteUser };
