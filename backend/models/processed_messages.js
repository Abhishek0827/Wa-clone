const mongoose = require("mongoose");

const processedMessageSchema = new mongoose.Schema({
  messageId: { type: String, required: true }, // ✅ unique ID for delivery tracking
  message: { type: String, required: true },
  status: { type: String, required: true },
  room: { type: String, required: true },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderName: { type: String, required: true },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverName: { type: String, required: true },
  date: { type: String, required: true }, // format: dd-mm-yyyy
  time: { type: String, required: true }, // format: hh:mm
});

module.exports = mongoose.model("processed_messages", processedMessageSchema);
