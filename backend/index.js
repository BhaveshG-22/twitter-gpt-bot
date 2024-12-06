const express = require("express");
const app = express();
const dotenv = require("dotenv");

dotenv.config();

app.get("/", (req, res) => {
  res.send("HOME PAGE");
});

app.get("/authLink", async (req, res) => {
  res.send("authLink PAGE");
});

app.listen("3021", () => {
  console.log("Server Listening on port 3021");
});
