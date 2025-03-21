require("dotenv").config();

const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

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
app.use(express.static("../front-end/public"));

app.post("/new-chat", async (_req, res) => {
  console.log("New chat");
  try {
    const response = await axios.post(
      "https://api.atlas.zenitech.co.uk/api/chat/create",
      { accountId: process.env.ATLAS_ACCOUNT_ID },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response);
    res.status(200).send({ chatId: response.data["chatid"] });
  } catch (error) {
    console.log("Ivyko klaida!", error);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || "Unknown error",
    });
  }
});

app.post("/prompt-chat/:id", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.atlas.zenitech.co.uk/api/chat/sendMessage",
      {
        chatId: parseInt(req.params.id, 10),
        message: req.body.message,
      },
      {
        headers: { "Content-Type": "application/json" },
        responseType: "stream",
      }
    );
    res.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Transfer-Encoding": "chunked",
    });
    response.data.on("data", (chunk) => {
      res.write(chunk.toString());
    });
    response.data.on("end", () => {
      res.end();
    });
  } catch (error) {
    console.log("Ivyko klaida!", error);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || "Unknown error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
