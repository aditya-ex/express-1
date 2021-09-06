const Token = require("../models/access_token");
const User = require("../models/User");
const Address = require("../models/address");

const saveAddress = async (req, res) => {
  try {
    const token = await Token.findOne({ token: req.headers.access_token });
    const user = await User.findOne({ _id: token.userId });
    const address = new Address();
    address.user_id = user._id;
    address.address = req.body.address;
    address.state = req.body.state;
    address.city = req.body.city;
    address.pin_code = req.body.pin_code;
    address.phone_no = req.body.phone_no;
    let savedAddress = await address.save();
    res.send(savedAddress);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {saveAddress};