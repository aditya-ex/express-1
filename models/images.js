const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  images: {
    type: Buffer,
  },
  imageURL:{
    type: String,
  } 
});

module.exports = Images = mongoose.model("Images", ImageSchema);
