import { CAPACITY, canPour, pour, isSolved } from '../site/src/rules.js';

// 試験管の並び順を無視した状態の鍵
export function stateKey(tubes) {
  return tubes.map((t) => t.join(',')).sort().join('|');
}

// 下限。各試験管の一番下以外の区切りは少なくとも1回動く。
// 同じ色が複数の試験管の底にあれば、1本を残して底ごと動く。
// 1手で減るのは高々1（普通・ハードの両方で成り立つ）ので、許容的かつ一貫的。
export function heuristic(tubes) {
  let h = 0;
  const bottoms = new Map();
  for (const t of tubes) {
    if (t.length === 0) continue;
    bottoms.set(t[0], (bottoms.get(t[0]) ?? 0) + 1);
    for (let k = 1; k < t.length; k++) if (t[k] !== t[k - 1]) h++;
  }
  for (const b of bottoms.values()) h += b - 1;
  return h;
}

// 1色だけの試験管を空へ丸ごと移す手は、並べ替えと同じなので除く
function isPointless(tubes, from, to) {
  const a = tubes[from];
  return tubes[to].length === 0 && a.every((c) => c === a[0]);
}

export function solve(start, { cap = CAPACITY, maxNodes = 1_000_000, mixed = false } = {}) {
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
        if (!canPour(tubes, from, to, cap, mixed) || isPointless(tubes, from, to)) continue;
        const next = pour(tubes, from, to, cap, mixed);
        const key = stateKey(next);
        const old = bestG.get(key);
        if (old !== undefined && old <= g + 1) continue;
        bestG.set(key, g + 1);
        push(next, g + 1);
      }
    }
  }
}
