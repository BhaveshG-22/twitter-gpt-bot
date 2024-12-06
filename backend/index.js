const express = require("express");
const app = express();
const { TwitterApi } = require("twitter-api-v2");

const dotenv = require("dotenv");

dotenv.config();

app.get("/", (req, res) => {
  res.send("HOME PAGE");
});

app.get("/authLink", async (req, res) => {
  let link = null;
  let client = await new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_KEY_SECRET,
  });

  link = await client.generateAuthLink(process.env.CALLBACK_URL, {
    scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  });

  console.log(link);

  link ? res.send(link.url) : res.send("Link not ready");
});

app.get("/callback_url", (req, res) => {
  res.send("callback PAGE");
});

app.listen("3022", () => {
  console.log("Server Listening on port 3022");
});
