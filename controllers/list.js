const User = require("../models/User");

const list = async (req, res) => {
  let perPage = 10;
  let page = Math.max(0, req.params["page"]);
  let userList = await User.find()
    .select("username")
    .skip(perPage * (page - 1))
    .limit(perPage)
    .sort({ username: "asc" });
  res.json(userList);
};

module.exports = { list };
