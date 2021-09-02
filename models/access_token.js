const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        expires: "1h",
        default: Date.now
    }
});

module.exports = Token = mongoose.model("Token", tokenSchema);