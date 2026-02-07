import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { spinSlots } from "./games/slots.js";
import { bonusReward } from "./games/bonus.js";
import { initFishing } from "./games/fishing.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get("/", (_, res) => res.send("Sleek Sands Backend Live"));

app.post("/api/slots/spin", (_, res) => {
  res.json(spinSlots());
});

app.post("/api/bonus", (_, res) => {
  res.json({ reward: bonusReward() });
});

initFishing(io);

server.listen(process.env.PORT || 10000);
