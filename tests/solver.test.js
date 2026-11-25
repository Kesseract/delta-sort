import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canPour, pour, isSolved } from '../site/src/rules.js';
import { mulberry32, randomPuzzle } from '../tools/random.mjs';
import { stateKey, heuristic, solve } from '../tools/solver.mjs';

// 検算用の素朴な幅優先探索（小さい盤面専用）
function bfs(start) {
  if (isSolved(start)) return 0;
  const seen = new Set([stateKey(start)]);
  let frontier = [start];
  for (let depth = 1; frontier.length > 0; depth++) {
    const next = [];
    for (const tubes of frontier) {
      for (let a = 0; a < tubes.length; a++) {
        for (let b = 0; b < tubes.length; b++) {
          if (!canPour(tubes, a, b)) continue;
          const t = pour(tubes, a, b);
          if (isSolved(t)) return depth;
          const k = stateKey(t);
          if (!seen.has(k)) { seen.add(k); next.push(t); }
        }
      }
    }
    frontier = next;
  }
  return null;
}

test('mulberry32 は同じシードで同じ列', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 5; i++) {
    const v = a();
    assert.equal(v, b());
    assert.ok(v >= 0 && v < 1);
  }
});

test('randomPuzzle は各色4個・空き2本', () => {
  const tubes = randomPuzzle(5, mulberry32(1));
  assert.equal(tubes.length, 7);
  assert.deepEqual(tubes.slice(5), [[], []]);
  tubes.slice(0, 5).forEach((t) => assert.equal(t.length, 4));
  const counts = new Map();
  tubes.flat().forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1));
  assert.deepEqual([...counts.keys()].sort(), [0, 1, 2, 3, 4]);
  counts.forEach((n) => assert.equal(n, 4));
});

test('stateKey は試験管の順番を無視する', () => {
  assert.equal(stateKey([[0, 1], [], [1]]), stateKey([[1], [0, 1], []]));
  assert.notEqual(stateKey([[0, 1], [1]]), stateKey([[1, 0], [1]]));
});

test('heuristic は解けた状態で0', () => {
  assert.equal(heuristic([[0, 0, 0, 0], [1, 1, 1, 1], []]), 0);
  assert.equal(heuristic([[0, 0, 0, 1], [1, 1, 1, 0], []]), 2);
});

test('既に解けていれば0手', () => {
  assert.equal(solve([[0, 0, 0, 0], [1, 1, 1, 1], [], []]), 0);
});

test('小さい既知の問題', () => {
  assert.equal(solve([[0, 0, 0, 0], [1, 1, 1], [1]]), 1);
  assert.equal(solve([[0, 0, 0, 1], [1, 1, 1, 0], []]), 3);
});

test('動かせない盤面は null', () => {
  assert.equal(solve([[0, 1, 0, 1], [1, 0, 1, 0]]), null);
});

test('探索上限を超えたら null', () => {
  const tubes = randomPuzzle(8, mulberry32(7));
  assert.equal(solve(tubes, { maxNodes: 1 }), null);
});

test('小さいランダム問題で幅優先探索と一致する', () => {
  const rand = mulberry32(2026);
  for (let i = 0; i < 30; i++) {
    const tubes = randomPuzzle(3, rand);
    assert.equal(solve(tubes), bfs(tubes), JSON.stringify(tubes));
  }
});
