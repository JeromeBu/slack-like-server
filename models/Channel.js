const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

const Schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

Schema.plugin(uniqueValidator);

const Channel = mongoose.model("Channel", Schema);

module.exports = Channel;
