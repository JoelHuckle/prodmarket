const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
  },
  caption: {
    type: String,
  },
  instagram: {
    type: String,
  },
  following: {
    type: Array,
    default: [],
  },
  pendingServices: {
    type: Array,
    default: [],
  },
  subscribedTo: {
    type: Array,
    default: [],
  },
  purchasedLoops: {
    type: Array,
    default: [],
  },
  purchasedServices: {
    type: Array,
    default: [],
  },
  lastPosted: {
    type: Date,
  },
});

module.exports = mongoose.model("User", UserSchema);
