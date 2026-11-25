import { CAPACITY, EMPTY_TUBES } from '../site/src/rules.js';

export function mulberry32(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomPuzzle(colorCount, rand, cap = CAPACITY) {
  const bag = [];
  for (let c = 0; c < colorCount; c++) for (let k = 0; k < cap; k++) bag.push(c);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  const tubes = [];
  for (let i = 0; i < colorCount; i++) tubes.push(bag.slice(i * cap, (i + 1) * cap));
  for (let i = 0; i < EMPTY_TUBES; i++) tubes.push([]);
  return tubes;
}
