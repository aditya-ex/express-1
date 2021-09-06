const cloudinary = require("cloudinary");
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
module.exports = {uploadOnline};