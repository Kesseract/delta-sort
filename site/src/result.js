export function rankOf(moves, optimal) {
  if (moves <= optimal) return 'S';
  if (moves <= optimal * 1.15) return 'A';
  if (moves <= optimal * 1.4) return 'B';
  return 'C';
}

export function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
