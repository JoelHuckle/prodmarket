const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    require: true,
  },
  tags: {
    type: Array,
    default: [],
  },
  likes: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  download: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
