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
      res.status(201).send("user saved");
    }
  } catch (err) {
    console.log(err);
    res.send("user not saved");
  }
};

const login = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

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
    } else {
      res.status(500).send("internal server error");
    }
  }
};

const deleteUser = async (req, res) => {
  try {
    const token = await Token.findOne({ token: req.headers.access_token });
    const userResult = await User.findById({ _id: token.userId });
    if (!userResult) {
      res.status(404).json({ msg: "user not found" });
    }
    await userResult.remove();
    res.send("user removed");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
};

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
    user.address_id = address._id;
    await user.save();
    await address.save();
    res.send("address saved successfully");
  } catch (err) {
    res.send("failed to save address");
    console.log(err);
  }
};

const getAddress = async (req, res) => {
  try {
    const userResult = await User.findById(req.params.id).populate(
      "address_id"
    );
    if (!userResult) {
      return res.status(404).send({ msg: "user not found" });
    }
    res.json(userResult);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
};

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

const deleteAddress = async (req, res) => {
  try {
    let addressToDelete = [];
    const token = await Token.findOne({ token: req.headers.access_token });
    const address = await Address.find({ user_id: token.userId });
    for (let i = 0; i < address.length; i++) {
      let id = address[i]._id.toString();
      addressToDelete.push(id);
    }
    let deletedAddress = address.deleteMany({ _id: { $in: addressToDelete } });
    res.send("address deleted");
  } catch (err) {
    res.send("an error occured");
    console.log(err);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("user doesn't exist");
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
    res.send("an err occured");
    console.log(err);
  }
};

const resetPassword = async (req, res) => {
  try {
    const headerToken = await Token.findOne({
      token: req.headers.access_token,
    });
    const user = await User.findById({ _id: headerToken.userId });
    if (!user) return res.status(400).send("invalid user");

    const token = await resetToken.findOne({
      userId: user._id,
      token: req.params.password_reset_token,
    });
    if (!token) return res.status(400).send("invalid token");
    let password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    await token.delete();
    await sendEmail(user.sendEmail, "password reset successful");
    res.send("password reset done");
  } catch (err) {
    res.send("an error occured");
    console.log(err);
  }
};

const localUpload = async (req, res) => {
  try {
    let image = new Images({
      images: req.file.path,
    });
    image.save();
    console.log(req.files);
    res.send("image saved locally");
  } catch (err) {
    res.send("err while uploading image locally");
    console.log(err);
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnline = async (req, res) => {
  try {
    const data = {
      image: req.files.image,
    };
    await cloudinary.uploader.upload(data.image.tempFilePath);
    res.status(200).send("success");
  } catch (err) {
    res.send("error occured while uploading image online");
    console.log(err);
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
