// 盤面 tubes は number[][]。各試験管は下から上へ色番号を並べる。
export const CAPACITY = 4;
export const EMPTY_TUBES = 2;

// mixed（ハード）では、違う色の上にも注げる
export function canPour(tubes, from, to, cap = CAPACITY, mixed = false) {
  if (from === to) return false;
  const a = tubes[from];
  const b = tubes[to];
  if (a.length === 0 || b.length >= cap) return false;
  return mixed || b.length === 0 || b[b.length - 1] === a[a.length - 1];
}

// 一番上から続く同じ色を、入るだけまとめて注いだ新しい盤面を返す。
export function pour(tubes, from, to, cap = CAPACITY, mixed = false) {
  if (!canPour(tubes, from, to, cap, mixed)) return null;
  const next = tubes.map((t) => t.slice());
  const a = next[from];
  const b = next[to];
  const color = a[a.length - 1];
  while (a.length > 0 && a[a.length - 1] === color && b.length < cap) b.push(a.pop());
  return next;
}

// 一番上から続く同じ色の数（空なら0）
export function topRunLength(tube) {
  let n = 0;
  while (n < tube.length && tube[tube.length - 1 - n] === tube[tube.length - 1]) n++;
  return n;
}

export function isSolved(tubes, cap = CAPACITY) {
  return tubes.every((t) => t.length === 0 || (t.length === cap && t.every((c) => c === t[0])));
}
