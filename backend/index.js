const express = require("express");
const app = express();
const { TwitterApi } = require("twitter-api-v2");
const cors = require("cors");

app.use(cors()); //TODO: Configure proper CORS origins and requests

const dotenv = require("dotenv");
dotenv.config();

app.get("/", (req, res) => {
  res.send("HOME PAGE");
});

app.get("/authLink", async (req, res) => {
  try {
    let client = await new TwitterApi({
      appKey: process.env.API_KEY,
      appSecret: process.env.API_KEY_SECRET,
    });

    const link = await client.generateAuthLink(process.env.CALLBACK_URL, {
      scope: ["tweet.read", "tweet.write", "offline.access"],
    });

    if (link) {
      res.json({ link: link.url });
    } else {
      res.status(500).send("Link generation failed");
    }
  } catch (error) {
    console.error(error);
  }
});

app.get("/callback_url", (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  //TODO: store in db
  res.send(`Token: ${oauth_token}, Verifier: ${oauth_verifier}`);
});

app.listen("3022", () => {
  console.log("Server Listening on port 3022");
});
