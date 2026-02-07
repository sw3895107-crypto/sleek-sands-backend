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
}, 3000);

export function initFishingSocket(io) {

  io.on("connection", (socket) => {
    console.log("Player joined:", socket.id);

    players[socket.id] = {
      id: socket.id,
      score: 0
    };

    socket.emit("fish:init", fish);
    io.emit("players:update", players);

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

}
