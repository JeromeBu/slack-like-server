const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  text: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Channel"
  },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", Schema);

module.exports = Message;
