let fish = [];

export function initFishing(io) {
  setInterval(() => {
    fish.push({
      id: Date.now(),
      x: Math.random() * 800,
      y: Math.random() * 500
    });
    io.emit("fish:update", fish);
  }, 3000);

  io.on("connection", socket => {
    socket.emit("fish:init", fish);

    socket.on("shoot", shot => {
      fish = fish.filter(f =>
        Math.abs(f.x - shot.x) > 30 || Math.abs(f.y - shot.y) > 30
      );
      io.emit("fish:update", fish);
    });
  });
}
