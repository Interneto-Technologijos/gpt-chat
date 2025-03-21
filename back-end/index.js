const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/prompt", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.atlas.zenitech.co.uk/api/chat/sendMessage",
      req.body,
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
