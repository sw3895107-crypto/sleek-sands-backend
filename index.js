import express from "express";
import cors from "cors";
import pkg from "pg";
import http from "http";
import { Server } from "socket.io";

import { spinSlots } from "./server/games/slots.js";
import { initFishingSocket } from "./server/games/fishing.js";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* ---------------- HEALTH ---------------- */

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "database error" });
  }
});

/* ---------------- ROOT ---------------- */

app.get("/", (req, res) => {
  res.send("Casino backend live");
});

/* ---------------- STATUS ---------------- */

app.get("/api/status", (req, res) => {
  res.json({ message: "API running" });
});

/* ---------------- SLOT ENGINE ---------------- */

app.post("/api/slots/spin", (req, res) => {
  const result = spinSlots();
  res.json(result);
});

/* ---------------- SOCKET GAME ---------------- */

initFishingSocket(io);

/* ---------------- START ---------------- */

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
