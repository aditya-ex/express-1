const express = require("express");
const router = express.Router();
const md5 = require("md5");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Token = require("../models/access_token");
const Address = require("../models/address");
const checkObjectId = require("../config/config");

router.post("/register", async (req, res) => {
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
    let savedUser = await user.save();
    res.status(201).send(savedUser);
  } else {
    res.status(401).send("unauthorized");
  }
});

router.post("/login", async (req, res) => {
  const body = req.body;
  const user = await User.findOne({ username: body.username });

  if (user) {
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (validPassword) {
      let token = new Token();
      let access_token = md5(Date);
      token.userId = user._id;
      token.token = access_token;
      let savedToken = await token.save();
      res.send(savedToken);
    } else {
      res.status(500).send("internal server error");
    }
  }
});

router.get("/get", async (req, res) => {
  try {
    const userResult = await Address.findById(req.headers.access_token).populate("user_id");
    if (!userResult) {
      return res.status(404).json({ msg: "user not found" });
    }
    res.json(userResult);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

router.put("/delete", checkObjectId, async (req, res) => {
  try {
    const userResult = await User.findById(req.headers.access_token);
    if (!userResult) {
      res.status(404).json({ msg: "user not found" });
    }
    userResult.remove();
    res.send("user removed");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

router.get("/list/:page", async (req, res) => {
  let perPage = 10;
  let page = Math.max(0, req.params["page"]);
  let userList = await User.find()
    .select("username")
    .skip(perPage * (page - 1))
    .limit(perPage)
    .sort({ username: "asc" });
  res.json(userList);
});

router.post("/address", checkObjectId,async(req, res) => {
  try{
    const user = await User.findOne({ _id: req.headers.access_token });
    const address = new Address();
    address.user_id = user._id;
    address.address = req.body.address;
    address.state = req.body.state;
    address.city = req.body.city;
    address.pin_code = req.body.pin_code;
    address.phone_no = req.body.phone_no;
    let savedAddress = await address.save();
    res.send(savedAddress);
  }catch(err){
    console.log(err);
  }
});
module.exports = router;
