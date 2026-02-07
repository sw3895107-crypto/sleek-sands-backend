import express from "express";
import cors from "cors";
import pkg from "pg";
import http from "http";
import { Server } from "socket.io";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create HTTP server + socket layer
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* -----------------------------
   DATABASE HEALTH
------------------------------*/
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "database error" });
  }
});

/* -----------------------------
   ROOT
------------------------------*/
app.get("/", (req, res) => {
  res.send("Sleek Sands backend running");
});

app.get("/api/status", (req, res) => {
  res.json({ message: "API live" });
});

/* -----------------------------
   SLOT GAME ENGINE (SERVER RNG)
------------------------------*/
function spinSlots() {
  const symbols = ["7", "BAR", "CHERRY", "BELL"];
  const result = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  const isWin =
    result[0] === result[1] &&
    result[1] === result[2];

  return {
    reels: result,
    win: isWin,
    payout: isWin ? 10 : 0,
    sound: isWin ? "slot_win" : "spin"
  };
}

app.post("/api/slots/spin", (req, res) => {
  const outcome = spinSlots();
  res.json(outcome);
});

/* -----------------------------
   MULTIPLAYER FISHING (SOCKET)
------------------------------*/

let players = {};
let fish = [];

function spawnFish() {
  const directions = ["left", "right", "up", "down"];
  fish.push({
    id: Date.now(),
    x: Math.random() * 800,
    y: Math.random() * 600,
    direction: directions[Math.floor(Math.random() * directions.length)],
    speed: Math.random() * 2 + 1
  });
}

setInterval(() => {
  spawnFish();
  io.emit("fish:update", fish);
}, 3000);

io.on("connection", (socket) => {
  console.log("player connected", socket.id);

  players[socket.id] = {
    id: socket.id,
    score: 0
  };

  socket.emit("fish:init", fish);

  socket.on("shoot", (shot) => {
    fish = fish.filter(f => {
      const hit =
        Math.abs(f.x - shot.x) < 40 &&
        Math.abs(f.y - shot.y) < 40;

      if (hit) {
        players[socket.id].score += 1;
        io.emit("sound:event", "fish_hit");
      }

      return !hit;
    });

    io.emit("fish:update", fish);
    io.emit("players:update", players);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("players:update", players);
  });
});

/* -----------------------------
   START SERVER
------------------------------*/
const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
