const User = require("../models/User");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const user = new User();
    const salt = await bcrypt.genSalt(10);
    user.username = req.body.username;
    user.email = req.body.email;
    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    password = req.body.password;
    con_password = req.body.con_password;
    if (password == con_password) {
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      res.status(201).send("user saved");
    }
  } catch (err) {
    console.log(err);
    res.send("user not saved");
  }
};

module.exports = {register};
