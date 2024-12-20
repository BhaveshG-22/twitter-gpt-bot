const { tokensModel } = require("./models/tokens");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// async function generateAuthLink(client) {
//   try {
//     const authLink = await client.generateAuthLink(process.env.CALLBACK_URL, {
//       scope: ["tweet.read", "tweet.write", "offline.access"],
//     });
//     return authLink;
//   } catch (error) {
//     throw new Error("Auth link generation failed: " + error.message);
//   }
// }

// async function oauth2Link(client) {
//   try {
//     const demo = client.generateOAuth2AuthLink(process.env.CALLBACK_URL, {
//       scope: ["tweet.read", "users.read"],
//     });
//     console.log(demo);
//   } catch (error) {
//     throw new Error("Auth link generation failed: " + error.message);
//   }
// }

// async function saveTokens(authLinkResp) {
//   try {
//     const tokens = new tokensModel(authLinkResp);
//     const resp = await tokens.save();
//     return resp;
//   } catch (error) {
//     throw new Error("Error saving to database: " + error.message);
//   }
// }
// async function saveStep1ToDB(authLinkResp) {
//   try {
//     const tokens = new tokensModel(authLinkResp);
//     const resp = await tokens.save();
//     return resp;
//   } catch (error) {
//     throw new Error("Error saving to database: " + error.message);
//   }
// }

// async function verifyOAuthToken(state) {
//   try {
//     console.log(state);
//     const obj = await tokensModel.findOne({ state: state });
//     if (obj) {
//       return { verified: true, obj };
//     } else {
//       return { verified: false };
//     }
//   } catch (error) {
//     console.error("Error verifying Token in database: " + error.message);
//     return { verified: false, error: error.message };
//   }
// }
async function saveTokenv2(newTokens) {
  console.log("in/SAVETOKENS:", newTokens);

  try {
    const { codeVerifier, state, sequence, url } = newTokens;
    let response;

    // Check for an existing entry with the given codeVerifier
    const codeVerifierEntry = await tokensModel.findOne({
      codeVerifier: codeVerifier,
    });

    // Check for an existing entry with the given state
    let stateEntry;
    if (codeVerifierEntry) {
      stateEntry = await tokensModel.findOne({
        state: codeVerifierEntry.state,
      });
    }

    switch (sequence) {
      case 1:
        console.log("1");

        const toSave = new tokensModel({
          state,
          codeVerifier,
          url,
        });

        response = await toSave.save();

        console.log("CASE 1 EXECUTED");
        break;

      case 2:
        console.log("2");

        let codeVerifierEntry = await tokensModel.findOne({
          codeVerifier: newTokens.codeVerifier,
        });

        if (!codeVerifierEntry.codeVerifier) {
          console.error("codeVerifierEntry not found");
          break;
        }

        console.log("codeVerifierEntry FOUND SUCCESSFULLY");

        let updatedToken = codeVerifierEntry;
        updatedToken.accessToken = newTokens.accessToken;
        updatedToken.refreshToken = newTokens.refreshToken;

        console.log("updatedToken Created");

        response = new tokensModel(updatedToken);
        response = await response.save();
        console.log("CASE 2 EXECUTED");
        break;

      case 3:
        const obj = await tokensModel.findOne({
          state: newTokens.state,
          refreshToken: newTokens.refreshToken,
        });

        response = obj;
        console.log("CASE 3 EXECUTED");

        break;

      default:
        console.error("ERORRRR LINE 110");
        response = sequence;
    }

    //console.log("Response:", response);
    return response;
  } catch (error) {
    //console.error("Error saving to database:", error.message);
    throw new Error("Error saving to database: " + error.message);
  }
}

async function isStateInDatabase(state) {
  try {
    const resp = await tokensModel.findOne({ state });

    return !resp
      ? { exists: false }
      : { exists: true, codeVerifier: resp.codeVerifier, resp: resp };
  } catch (error) {
    return error;
  }
}

async function getRefreshToken(newState) {
  try {
    const refreshToken = await tokensModel.findOne({ state: newState });
    return refreshToken.refreshToken;
  } catch (error) {
    res.send("invalid state string");
  }
}

async function saveStateCodeVerifier(data) {
  const { codeVerifier, state, url } = data;
  const tokens = new tokensModel({ codeVerifier, state, url });
  response = await tokens.save();
  // console.log("saveStateCodeVerifier EXCECUTEDDDDD");
  // console.log("response");
  // console.log(response);
  return response;
}

async function createJWT(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "5m" });
  } catch (error) {
    console.error("Error creating JWT:", error);
    throw new Error("Failed to create JWT");
  }
}

function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Error verifying JWT:", error);
    throw new Error("Invalid or expired token");
  }
}
module.exports = {
  // generateAuthLink,
  // saveStep1ToDB,
  // verifyOAuthToken,
  // oauth2Link,
  // saveTokens,
  saveTokenv2,
  isStateInDatabase,
  getRefreshToken,
  saveStateCodeVerifier,
  createJWT,
  verifyJWT,
};
