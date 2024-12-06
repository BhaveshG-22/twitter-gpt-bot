const express = require("express");
const app = express();
const { TwitterApi } = require("twitter-api-v2");

const dotenv = require("dotenv");

dotenv.config();

async function initializeTwitter() {
  const client = new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_KEY_SECRET,
  });

  const link = await client.generateAuthLink(process.env.CALLBACK_URL);
  console.log(link);
}

initializeTwitter();

app.get("/", (req, res) => {
  res.send("HOME PAGE");
});

app.get("/authLink", async (req, res) => {
  res.send("authLink PAGE");
});

app.listen("3022", () => {
  console.log("Server Listening on port 3022");
});
