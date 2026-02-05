import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection (Render automatically provides DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Sleek Sands backend running" });
});

// Health check route (used by frontend)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API status test route
app.get("/api/status", (req, res) => {
  res.json({ message: "API connected successfully" });
});

// Example DB test route
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected",
      time: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
