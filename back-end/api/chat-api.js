const axios = require("axios");
const app = require("../app");

const { authMiddleware } = require("./auth-api");

app.post("/new-chat", authMiddleware, async (_req, res) => {
  try {
    const response = await axios.post(
      "https://api.atlas.zenitech.co.uk/api/chat/create",
      { accountId: process.env.ATLAS_ACCOUNT_ID },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    res.status(200).send({ chatId: response.data["chatid"] });
  } catch (error) {
    console.log("Ivyko klaida!", error);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || "Unknown error",
    });
  }
});

app.post("/prompt-chat/:id", authMiddleware, async (req, res) => {
  const chatId = parseInt(req.params.id, 10);
  if (isNaN(chatId) || chatId <= 0 || !Number.isInteger(chatId)) {
    return res.status(400).json({ error: "Invalid chat ID" });
  }
  try {
    const response = await axios.post(
      "https://api.atlas.zenitech.co.uk/api/chat/sendMessage",
      {
        chatId,
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
