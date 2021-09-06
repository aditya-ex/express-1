const Images = require("../models/images");

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
module.exports = {localUpload};