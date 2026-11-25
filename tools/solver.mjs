import { CAPACITY, canPour, pour, isSolved } from '../site/src/rules.js';

// 試験管の並び順を無視した状態の鍵
export function stateKey(tubes) {
  return tubes.map((t) => t.join(',')).sort().join('|');
}

// 色の区切りの数 − 色の数。1手で高々1しか減らないので許容的。
export function heuristic(tubes) {
  let segments = 0;
  const colors = new Set();
  for (const t of tubes) {
    for (let k = 0; k < t.length; k++) {
      colors.add(t[k]);
      if (k === 0 || t[k] !== t[k - 1]) segments++;
    }
  }
  return segments - colors.size;
}

// 1色だけの試験管を空へ丸ごと移す手は、並べ替えと同じなので除く
function isPointless(tubes, from, to) {
  const a = tubes[from];
  return tubes[to].length === 0 && a.every((c) => c === a[0]);
}

export function solve(start, { cap = CAPACITY, maxNodes = 1_000_000 } = {}) {
  if (isSolved(start, cap)) return 0;
  const buckets = [];
  const bestG = new Map();
  const push = (tubes, g) => {
    const f = g + heuristic(tubes);
    (buckets[f] ??= []).push({ tubes, g });
  };
  bestG.set(stateKey(start), 0);
  push(start, 0);
  let f = 0;
  let expanded = 0;
  for (;;) {
    while (f < buckets.length && !(buckets[f]?.length > 0)) f++;
    if (f >= buckets.length) return null;
    const { tubes, g } = buckets[f].pop();
    if (bestG.get(stateKey(tubes)) < g) continue;
    if (isSolved(tubes, cap)) return g;
    if (++expanded > maxNodes) return null;
    for (let from = 0; from < tubes.length; from++) {
      for (let to = 0; to < tubes.length; to++) {
        if (!canPour(tubes, from, to, cap) || isPointless(tubes, from, to)) continue;
        const next = pour(tubes, from, to, cap);
        const key = stateKey(next);
        const old = bestG.get(key);
        if (old !== undefined && old <= g + 1) continue;
        bestG.set(key, g + 1);
        push(next, g + 1);
      }
    }
  }
}
