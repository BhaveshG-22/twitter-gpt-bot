const { TwitterApi } = require("twitter-api-v2");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const twitterClient = new TwitterApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

let codeVerifier; // Store the code verifier globally for PKCE
let state; // Store state globally for PKCE

// Route to generate and redirect to the Twitter login URL
app.get("/login", async function (req, res) {
  try {
    // Generate the authorization link and save the codeVerifier and state
    const {
      url,
      codeVerifier: generatedVerifier,
      state: generatedState,
    } = twitterClient.generateOAuth2AuthLink(
      "http://127.0.0.1:3090/callback", // Callback URL
      {
        scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      }
    );

    // Save the generated codeVerifier and state globally
    codeVerifier = generatedVerifier;
    state = generatedState;

    // Redirect the user to the Twitter authorization URL
    res.redirect(url);
  } catch (error) {
    console.error("Error generating login URL:", error);
    res.status(500).send("Error generating login URL");
  }
});

// Route to handle the callback after Twitter authorization
app.get("/callback", async function (req, res) {
  try {
    const { code, state: returnedState } = req.query; // Get the authorization code and state from the callback URL

    // Verify state matches
    if (returnedState !== state)
      return res.status(500).send("State doesn't match");

    // Exchange the authorization code for access token using the saved codeVerifier
    const {
      client: loggedClient,
      accessToken,
      refreshToken,
    } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: "http://127.0.0.1:3090/callback",
    });

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    // Use the access token to make a tweet
    const tweetText = `My first tweet using twitter-api-v2 with PKCE! +${
      Math.random() * 10000
    }`;
    const { data } = await loggedClient.v2.tweet(tweetText);

    res.send(`Tweet posted: ${tweetText}`, data);
  } catch (error) {
    console.error("Error handling callback:", error);
    res.status(500).send("Error handling callback");
  }
});

// Start the Express server
app.listen(3090, () => {
  console.log("Go here to login: http://127.0.0.1:3090/login");
});

