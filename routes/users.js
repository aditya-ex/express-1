const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary");
const registerController = require("../controllers/register");
const loginController = require("../controllers/login");
const deleteController = require("../controllers/delete");
const listController = require("../controllers/list");
const getAddressController = require("../controllers/getAddres");
const saveAddressController = require("../controllers/saveAddress");
const deleteAddressController = require("../controllers/deleteAddress");
const forgotPassword = require("../controllers/forgotPassword");
const resetPassword = require("../controllers/resetPassword");
const localUpload = require("../controllers/localUpload");
const uploadOnline = require("../controllers/uploadOnline");
const auth = require("../middleware/auth");
require("dotenv").config();
router.post("/register", registerController.register);

router.post("/login", loginController.login);

router.get("/get/:id", auth, getAddressController.getAddress);

router.put("/delete", auth, deleteController.deleteUser);

router.get("/list/:page", listController.list);

router.post("/address", auth, saveAddressController.saveAddress);

router.delete("/address/delete", auth, deleteAddressController.deleteAddress);

router.post("/forgot-password", auth, forgotPassword.forgotPassword);

router.post(
  "/verify_reset_password/:password_reset_token",
  auth,
  resetPassword.resetPassword
);
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../upload/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

let upload = multer({ storage: storage });

router.post("/upload", upload.single("image"), localUpload.localUpload);

router.post("/online_upload", uploadOnline.uploadOnline);
module.exports = router;
