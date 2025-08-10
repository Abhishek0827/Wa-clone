const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contactId: {
    type: String,
    required: true,
  },
  name: String,
  mobile: Number
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
    unique: true,
  },
  contacts: [contactSchema],
});

module.exports = mongoose.model("User", userSchema);
