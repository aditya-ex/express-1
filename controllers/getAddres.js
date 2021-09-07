const Address = require("../models/address");
const User = require("../models/User");

const getAddress = async (req, res) => {
  try {
    const userResult = await User.findById(req.params.id).populate("address_id");
    if (!userResult) {
      return res.status(404).send({ msg: "user not found" });
    }
    res.json(userResult);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
};

module.exports = {getAddress};
