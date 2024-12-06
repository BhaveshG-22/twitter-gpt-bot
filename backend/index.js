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

app.get("/authLink", async (req, res) => {
  try {
    let client = await new TwitterApi({
      appKey: process.env.API_KEY,
      appSecret: process.env.API_KEY_SECRET,
    });

    const authLinkResp = await db.generateAuthLink(client);
    await db.saveStep1ToDB(authLinkResp);

    if (authLinkResp) {
      res.json({ link: authLinkResp.url });
    }
  } catch (error) {
    console.error("Error in /authLink route:", error);
    res.status(500).send("Something went wrong");
  }
});

app.get("/callback_url", (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  console.log(oauth_token, oauth_verifier);
  //TODO: store in db
  res.send(`Token: ${oauth_token}, Verifier: ${oauth_verifier}`);
});
