const jwt = require("jsonwebtoken");
const app = require("../app");

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

module.exports = { authMiddleware };
