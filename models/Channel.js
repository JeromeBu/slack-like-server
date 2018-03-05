const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

const Schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

Schema.plugin(uniqueValidator);

const Channel = mongoose.model("Channel", Schema);

module.exports = Channel;
