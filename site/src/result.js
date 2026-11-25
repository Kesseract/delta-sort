export function rankOf(moves, optimal) {
  if (moves <= optimal) return 'S';
  // 浮動小数の誤差を避けるため整数で比べる
  if (moves * 100 <= optimal * 115) return 'A';
  if (moves * 100 <= optimal * 140) return 'B';
  return 'C';
}

export function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
