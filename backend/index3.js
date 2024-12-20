const express = require("express");
const app = express();
const { TwitterApi } = require("twitter-api-v2");
const cors = require("cors");
const mongoose = require("mongoose");

app.use(cors()); //TODO: Configure proper CORS origins and requests

const dotenv = require("dotenv");
const db = require("./helper");
dotenv.config();

//MONGO_DB CONNECTION
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 3022;

    app.listen(process.env.PORT || 3022, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

//ROUTES HANDELING
app.get("/", (req, res) => {
  res.send("HOME PAGE");
});

const client = new TwitterApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});
let codeVerifier;
let state;

app.get("/authLink", async (req, res) => {
  try {
    const {
      url,
      codeVerifier: generatedVerifier,
      state: generatedState,
    } = client.generateOAuth2AuthLink(
      "http://127.0.0.1:3022/callback", // Callback URL
      {
        scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      }
    );

    // Save the generated codeVerifier and state globally
    codeVerifier = generatedVerifier;
    state = generatedState;

    res.redirect(url);
  } catch (error) {
    console.error("Error in /authLink route:", error);
    res.status(500).send("Something went wrong");
  }
});

app.get("/callback", async (req, res) => {
  try {
    const { state: returnedState, code } = req.query;
    if (returnedState !== state) {
      return res.status(500).send("State doesn't match");
    }

    const {
      accessToken,
      client: LoggedClient,
      refreshToken,
    } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: "http://127.0.0.1:3022/callback",
    });

    await LoggedClient.v2.tweet("Hello World");
    res.send("tweet posted");
  } catch (error) {
    console.error("Error handling callback:", error);
    res.status(500).send("Error handling callback");
  }
});
