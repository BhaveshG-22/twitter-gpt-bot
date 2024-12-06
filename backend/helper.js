const { step1Model, Step1 } = require("./models/step1");
const dotenv = require("dotenv");
dotenv.config();

async function generateAuthLink(client) {
  try {
    const authLink = await client.generateAuthLink(process.env.CALLBACK_URL, {
      scope: ["tweet.read", "tweet.write", "offline.access"],
    });
    return authLink;
  } catch (error) {
    throw new Error("Auth link generation failed: " + error.message);
  }
}

async function saveStep1ToDB(authLinkResp) {
  try {
    const newStep1 = new step1Model(authLinkResp);
    await newStep1.save();
    // console.log("STEP1 SAVED", newStep1);
  } catch (error) {
    throw new Error("Error saving to database: " + error.message);
  }
}

module.exports = { generateAuthLink, saveStep1ToDB };
