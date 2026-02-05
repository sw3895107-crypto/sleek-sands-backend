import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/", (req, res) => {
  res.send("Hello from Render");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* USER REGISTER */
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users(email, password) VALUES($1,$2) RETURNING id",
      [email, hash]
    );

    res.json({ success: true, userId: result.rows[0].id });
  } catch (err) {
    res.status(400).json({ error: "User exists or DB error" });
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (!result.rows.length) return res.status(401).json({ error: "Invalid" });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(401).json({ error: "Invalid" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  res.json({ token });
});

/* STATUS */
app.get("/api/status", (req, res) => {
  res.json({ app: "sleek-sands", online: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
