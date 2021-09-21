const Address = require("../models/address");
const Images = require("../models/images");
const Token = require("../models/token");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const fs = require("fs");
// const { add } = require("cheerio/lib/api/traversing");
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
      let savedUser = await user.save();
      res.send({
        error: 0,
        message: "user saved successfully",
        data: savedUser,
      });
    } else {
      res.send({
        error: 1,
        message: "password don't match",
        data: [],
      });
    }
  } catch (err) {
    res.send({
      error: 1,
      message: "failed to save new user",
      data: err,
    });
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
        res.send({
          error: 0,
          message: "access token sent",
          data: access_token,
        });
      }
    } else {
      res.send({
        error: 1,
        message: "password don't match",
        data: [],
      });
    }
  } catch (err) {
    res.send({
      error: 1,
      message: err.message || "access token not sent",
      data: err,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    let user = req.user;
    await User.deleteOne({ _id: user._id });
    await Token.deleteOne({ userId: user._id });
    await Address.deleteMany({ user_id: user._id });
    await Images.deleteOne({ user_id: user._id });
    res.send({
      error: 0,
      message: "data deleted successfully",
      data: [],
    });
  } catch (err) {
    res.send({
      error: 1,
      message: err.message || "failed to delete data",
      data: err,
    });
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
    user.address.push(address._id);
    await user.save();
    let savedAddress = await address.save();
    res.send({
      error: 0,
      message: "address saved successfully",
      data: savedAddress,
    });
  } catch (err) {
    res.send({
      error: 1,
      message: err.message || "failed to save address",
      data: err,
    });
  }
};

const getAddress = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("address");
    if (!user) {
      res.send("user not found");
    }
    res.send({
      error: 0,
      message: "populated user successfully",
      data: user,
    });
  } catch (err) {
    res.send({
      error: 1,
      message: err.message || "failed to populate user",
      data: err,
    });
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
    res.send({
      error: 0,
      message: "user list found",
      data: userList,
    });
  } catch (err) {
    res.send({
      error: 1,
      message: err.message || "can't find user list",
      data: err,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    let addressToDelete = [];
    const user = req.user;
    let address = await Address.find({ user_id: user._id });
    address.map((data) => {
      addressToDelete.push(data._id);
    });
    await Address.deleteMany({ _id: { $in: addressToDelete } });
    res.send({
      error: 0,
      message: "address deleted successfully",
      data: [],
    });
  } catch (err) {
    res.send({
      error: 1,
      message: err.message || "failed to delete address",
      data: err,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) res.send("user doesn't exist");
    let token = new Token();
    let resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "600s",
    });
    token.userId = user._id;
    token.token = resetToken;
    await token.save();
    const link = `${process.env.BASE_URL}/verify_reset_password/${token.token}`;
    await sendEmail(user.email, "reset password link", link);
    res.send({
      error: 0,
      message: "reset token send",
      data: resetToken,
    });
  } catch (err) {
    res.send({
      error: 1,
      message: err.message || "can't send reset token",
      data: err,
    });
  }
};

const resetPassword = async (req, res) => {
  let resetToken = req.params.password_reset_token;
  try {
    await jwt.verify(resetToken, process.env.SECRET_KEY);
    let token = await Token.findOne({ token: resetToken });
    let user = await User.findById({ _id: token.userId });
    if (token) {
      let password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      let savedUser = await user.save();
      await Token.deleteOne({ token: token.token });
      await sendEmail(
        user.email,
        "reset password",
        "password reset successfull"
      );
      res.send({
        error: 0,
        message: "password reset successfull",
        data: savedUser,
      });
    }
  } catch (err) {
    res.send({
      error: 1,
      message: err.message || "failed to reset password",
      data: err,
    });
  }
};

const localUpload = async (req, res) => {
  try {
    let user = req.user;
    let img = fs.readFileSync(req.file.path);
    let encoded_image = img.toString("base64");
    let image = new Images({
      user_id: user._id,
      images: new Buffer(encoded_image, 'base64'),
    });
    let savedImage = await image.save();
    res.send({
      error: 0,
      message: "image saved successfully",
      data: savedImage,
    });
  } catch (err) {
    console.log(err);
    res.send({
      error: 1,
      message: err.message || "failed to save image",
      data: err,
    });
  }
};

const local = async (req, res) => {
  let id = req.params.id;
  let foundImage = await Images.findById({ _id: id });
  res.contentType('image/jpeg');
  res.send(foundImage.images);
};

const uploadOnline = async (req, res) => {
  try {
    console.log(req)
    let user = req.user;
    const data = req.file.path;
    let uploadedImage = await cloudinary.v2.uploader.upload(data);
    let image = new Images({
      user_id: user._id,
      imageURL: uploadedImage.secure_url,
    });
    let savedImage = await image.save();
    res.send({
      error: 0,
      message: "image saved successfully",
      data: savedImage,
    });
  } catch (err) {
    console.log(err);
    res.send({
      error: 1,
      message: err.message || "failed to save image",
      data: err,
    });
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
  local,
  resetPassword,
  saveAddress,
  uploadOnline,
};
