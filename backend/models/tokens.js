const mongoose = require("mongoose");

const tokens = new mongoose.Schema({
  url: { type: String, unique: true },

  codeVerifier: { type: String, unique: true },
  state: { type: String, unique: true },

  accessToken: { type: String },
  refreshToken: { type: String },
  expires_at: { type: Number },
});

const tokensModel = mongoose.model("tokens", tokens);

module.exports = { tokensModel };
