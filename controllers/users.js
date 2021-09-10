const Address = require("../models/address");
const Images = require("../models/images");
const Token = require("../models/token");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const { add } = require("cheerio/lib/api/traversing");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

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
      await sendEmail(
        user.email,
        "registration",
        "user registered successfully"
      );
      await user.save();
      res.send("successful");
    } else {
      res.send("password don't match");
    }
  } catch (err) {
    res.send("failure");
  }
};

const login = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  try {
    if (user) {
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (validPassword) {
        let token = new Token();
        let access_token = jwt.sign(
          { userId: user._id },
          process.env.SECRET_KEY,
          {
            expiresIn: "1h",
          }
        );
        token.userId = user._id;
        token.token = access_token;
        await token.save();
        res.send(access_token);
      }
    }
  } catch (err) {
    res.send(err);
  }
};

const deleteUser = async (req, res) => {
  try {
    let user = req.user;
    await user.remove();
    await Token.deleteOne({ userId: user._id });
    await Address.deleteMany({ user_id: user._id });
    await Images.deleteOne({ user_id: user._id });
    res.send("success");
  } catch (err) {
    res.send(err);
  }
};

const saveAddress = async (req, res) => {
  try {
    let user = req.user;
    const address = new Address();
    address.user_id = user._id;
    address.address = req.body.address;
    address.state = req.body.state;
    address.city = req.body.city;
    address.pin_code = req.body.pin_code;
    address.phone_no = req.body.phone_no;
    user.address_id = address._id;
    await address.save();
    await user.save();
    res.send("success");
  } catch (err) {
    res.send("failure");
  }
};

const getAddress = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("address_id");
    if (!user) {
      res.send("user not found");
    }
    res.json(user);
  } catch (err) {
    res.send("failure");
  }
};

const list = async (req, res) => {
  try {
    let perPage = 10;
    let page = Math.max(0, req.params["page"]);
    let userList = await User.find()
      .select("username")
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ username: "asc" });
    res.json(userList);
  } catch (err) {
    res.send("failure");
  }
};

const deleteAddress = async (req, res) => {
  try {
    let addressToDelete = [];
    const token = await Token.findOne({ token: req.headers.access_token });
    let address = await Address.find({ user_id: token.userId });
    address.map((data) => {
      addressToDelete.push(data._id);
    });
    await Address.deleteMany({ _id: { $in: addressToDelete } });
    res.send("successful");
  } catch (err) {
    res.send("failure");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) res.send("user doesn't exist");
    let token = await new Token();
    let resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "600s",
    });
    token.userId = user._id;
    token.token = resetToken;
    await token.save();
    const link = `${process.env.BASE_URL}/verify_reset_password/${token.token}`;
    await sendEmail(user.email, "reset password link", link);
    res.send(resetToken);
  } catch (err) {
    res.send("failed");
  }
};

const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) res.send("user not found");
    let resetToken = req.params.password_reset_token;
    const token = await Token.findOne({
      userId: user._id,
      token: resetToken,
    });
    if (token) {
      jwt.verify(resetToken, process.env.SECRET_KEY, async function (err) {
        if (err) {
          res.send(err);
        } else {
          let password = req.body.password;
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
          await Token.deleteOne({ token: token.token });
          await sendEmail(
            user.email,
            "reset password",
            "password reset successful"
          );
          res.send("successful");
        }
      });
    }
  } catch (err) {
    res.send(err);
  }
};

const localUpload = async (req, res) => {
  try {
    let user = req.user;
    let image = new Images({
      user_id: user._id,
      images: req.files.image,
    });
    await image.save();
    res.send("success");
  } catch (err) {
    res.send("failure");
  }
};

const uploadOnline = async (req, res) => {
  try {
    let user = req.user;
    const data = req.files.image;
    let image = new Images({
      user_id: user._id,
      images: data,
    });
    await image.save();
    await cloudinary.uploader.upload(data.tempFilePath);
    res.send("success");
  } catch (err) {
    res.send("failure");
  }
};
module.exports = {
  register,
  login,
  deleteUser,
  deleteAddress,
  forgotPassword,
  getAddress,
  list,
  localUpload,
  resetPassword,
  saveAddress,
  uploadOnline,
};
