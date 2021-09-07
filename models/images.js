const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  images: {
    type: String,
    required: true,
  },
});

module.exports = Images = mongoose.model("Images", ImageSchema);
