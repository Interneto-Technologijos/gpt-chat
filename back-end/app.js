require("dotenv").config();

const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3001;

const server = https.createServer(
  {
    key: fs.readFileSync("config/key.pem"),
    cert: fs.readFileSync("config/cert.pem"),
  },
  app
);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
