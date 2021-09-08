const Address = require("../models/address");
const Images = require("../models/images");
const resetToken = require("../models/resetToken");
const Token = require("../models/access_token");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
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
        let savedToken = await token.save();
        res.send(savedToken);
      }
    }
  } catch (err) {
    res.send("failure");
  }
};

const deleteUser = async (req, res) => {
  try {
    let user = req.user;
    if (!user) {
      res.send("user not found");
    }
    await user.remove();
    res.send("success");
  } catch (err) {
    res.send("failure");
    console.log(err);
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
    await user.save();
    await address.save();
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
    let address = req.address;
    for (let i = 0; i < address.length; i++) {
      let id = address[i]._id.toString();
      addressToDelete.push(id);
    }
    await address.deleteMany({ _id: { $in: addressToDelete } });
    res.send("successful");
  } catch (err) {
    res.send("failure");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) res.send("user doesn't exist");
    let token = await resetToken.findOne({ userId: user._id });
    if (!token) {
      token = await new resetToken({
        userId: user._id,
        token: jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
          expiresIn: "600",
        }),
      }).save();
    }
    const link = `${process.env.BASE_URL}/verify_reset_password/${token.token}`;
    await sendEmail(user.email, "reset password link", link);
    res.send(token);
  } catch (err) {
    res.send("failed");
  }
};

const resetPassword = async (req, res) => {
  try {
    let user = req.user;
    if (!user) res.send("invalid user");

    const resetToken = await resetToken.findOne({
      userId: user._id,
      token: req.params.password_reset_token,
    });
    if (!resetToken) res.send("invalid token");
    let password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    await resetToken.delete();
    await sendEmail(user.sendEmail, "password reset successful");
    res.send("successful");
  } catch (err) {
    res.send("failure");
  }
};

const localUpload = async (req, res) => {
  try {
    let image = new Images({
      images: req.file.path,
    });
    await image.save();
    res.send("success");
  } catch (err) {
    res.send("failure");
  }
};

const uploadOnline = async (req, res) => {
  try {
    const data = {
      image: req.files.image,
    };
    await cloudinary.uploader.upload(data.image.tempFilePath);
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
