const express = require("express");
const router = express.Router();
const data = require("../controllers/data");

router.get("/flipkart/mobile", data.flipkart);
router.get("/snapdeal/tshirts", data.snapdeal);
router.get("/flipkart/mobile/full", data.flipkart_full);
module.exports = router;
