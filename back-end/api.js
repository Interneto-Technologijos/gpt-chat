const axios = require("axios");
const jwt = require("jsonwebtoken");
const app = require("./app");

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (
    !username ||
    !password ||
    username.length > 100 ||
    password.length > 100
  ) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true, secure: true });
    return res.status(200).json({});
  }

  return res.status(401).json({ error: "Invalid username or password" });
});

app.post("/logout", authMiddleware, async (_req, res) => {
  res.cookie("token", "", { httpOnly: true, secure: true });
  return res.status(200).json({});
});

app.get("/verify", authMiddleware, (_req, res) => {
  res.status(200).json({});
});

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
