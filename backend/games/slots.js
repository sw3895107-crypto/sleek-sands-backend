const symbols = ["7", "BAR", "CHERRY", "BELL", "LEMON", "BONUS"];

export function spinSlots() {
  const reels = Array.from({ length: 3 }, () =>
    symbols[Math.floor(Math.random() * symbols.length)]
  );

  const isWin = reels.every(r => r === reels[0]);
  const isBonus = reels.includes("BONUS");

  let payout = 0;
  if (isWin) payout = reels[0] === "7" ? 100 : 25;

  return { reels, isWin, isBonus, payout };
}
