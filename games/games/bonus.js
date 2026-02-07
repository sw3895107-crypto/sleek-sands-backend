export function bonusReward() {
  const rewards = [10, 20, 50, 100];
  return rewards[Math.floor(Math.random() * rewards.length)];
}
