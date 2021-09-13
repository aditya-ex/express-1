const express = require("express");
const router = express.Router();
const multer = require("multer");
const users = require("../controllers/users");
const auth = require("../middleware/auth");
require("dotenv").config();

let storage = multer.diskStorage({
  destination: "images",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

let upload = multer({ storage: storage });

router.post("/register", users.register);

router.post("/login", users.login);

router.get("/get/:id", auth, users.getAddress);

router.put("/delete", auth, users.deleteUser);

router.get("/list/:page", users.list);

router.post("/address", auth, users.saveAddress);

router.delete("/address/delete", auth, users.deleteAddress);

router.post("/forgot_password", users.forgotPassword);

router.post(
  "/verify_reset_password/:password_reset_token",
  users.resetPassword
);

router.post("/upload", auth, upload.single("image"), users.localUpload);

router.post("/online_upload", auth, users.uploadOnline);

module.exports = router;
