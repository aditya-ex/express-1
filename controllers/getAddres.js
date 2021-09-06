const Address = require("../models/address");

const getAddress = async (req, res) => {
  try {
    const userResult = await Address.findById(req.params.id).populate(
      "user_id"
    );
    if (!userResult) {
      return res.status(404).json({ msg: "user not found" });
    }
    res.json(userResult);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
};

module.exports = {getAddress};
