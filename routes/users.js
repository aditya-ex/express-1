const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
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
      let access_token = user._id;
      res.send(access_token);
    } else {
      res.status(500).send("internal server error");
    }
  }
});

router.get("/get", checkObjectId, async (req, res) => {
  try {
    const userResult = await User.findById(req.headers.access_token);
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
    res.json(userResult);
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

module.exports = router;
