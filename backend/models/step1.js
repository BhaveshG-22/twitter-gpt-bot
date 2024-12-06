const mongoose = require("mongoose");

const Step1Schema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  oauth_token: { type: String, required: true },
  oauth_token_secret: { type: String, required: true },
});

const step1Model = mongoose.model("Step1", Step1Schema);

module.exports = { step1Model };
