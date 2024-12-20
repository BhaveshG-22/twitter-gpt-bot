const { TwitterApi } = require("twitter-api-v2");
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const {
  saveTokenv2,
  isStateInDatabase,
  getRefreshToken,
  createJWT,
  verifyJWT,
} = require("./helper");
const { tokensModel } = require("./models/tokens");

dotenv.config();

const twitterClient = new TwitterApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

let loggedClient;

app.get("/", async (req, res) => {
  try {
    const { url, state, codeVerifier } = twitterClient.generateOAuth2AuthLink(
      process.env.CALLBACK_URL,
      {
        scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      }
    );

    const response = await saveTokenv2({
      sequence: 1,
      state,
      codeVerifier,
      url,
    });

    if (response.url) {
      res.redirect(response.url);
    } else {
      res.status(500).send("INTERNAL SERVER ERROR /");
    }
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).send("An unexpected error occurred.");
  }
});

app.get("/callback", async (req, res) => {
  try {
    console.log("in /CALLBACK");

    const { state: newState, code } = req.query;

    if (!newState || !code) {
      return res.status(400).send({
        error: "Bad Request! Missing required query parameters.",
      });
    }

    const exists = await isStateInDatabase(newState);

    if (!exists || exists.exists === false) {
      return res.status(404).send({
        error: "State not found or invalid in the database.",
      });
    }

    let tokens;
    try {
      tokens = await twitterClient.loginWithOAuth2({
        code,
        codeVerifier: exists.codeVerifier,
        redirectUri: process.env.CALLBACK_URL,
      });
    } catch (loginError) {
      console.error("Error during Twitter login:", loginError.message);
      return res.status(500).send({
        error: "Failed to authenticate with Twitter.",
      });
    }

    const { accessToken, refreshToken, client: loggedClient } = tokens;

    console.log({
      codeVerifier: exists.codeVerifier,
      accessToken,
      refreshToken,
    });

    let objID;
    try {
      objID = await saveTokenv2({
        sequence: 2,
        codeVerifier: exists.codeVerifier,
        accessToken,
        refreshToken,
      });
    } catch (saveError) {
      console.error("Error saving tokens:", saveError.message);
      return res.status(500).send({
        error: "Failed to save tokens to the database.",
      });
    }

    if (!objID || !objID.state) {
      return res.status(500).send({
        error: "Token save operation returned an invalid object.",
      });
    }

    console.log("objID:", objID);

    const token = await createJWT({
      state: objID.state,
      refreshToken: objID.refreshToken,
    });

    res.redirect(`/tweet?token=${token}`);
  } catch (error) {
    console.error("Unexpected error:", error.message);
    res.status(500).send({
      error: "An unexpected error occurred.",
    });
  }
});

app.get("/tweet", async (req, res) => {
  try {
    const { token } = req.query;

    console.log(await verifyJWT(token));

    const { state, refreshToken } = await verifyJWT(token);

    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
    } = await twitterClient.refreshOAuth2Token(refreshToken);

    const { data } = await refreshedClient.v2.tweet(req.body);

    console.log(await isStateInDatabase(state));

    console.log({ accessToken: accessToken });
    console.log({ refreshToken: refreshToken });
    console.log({ newRefreshToken: newRefreshToken });

    const newTokenSave = await saveTokenv2({
      sequence: 3,
      state,

      refreshToken: refreshToken,
    });

    console.log("---newTokenSave");
    console.log(newTokenSave);

    res.send({ data: `FLOW COMPLETED` });
  } catch (error) {
    console.log(error);
    res.send({ error: error });
  }
});

app.listen("3030", (req, res) => {
  console.log("Server Listening");
  console.log("http://127.0.0.1:3030");
});
