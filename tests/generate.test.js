import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSolved } from '../site/src/rules.js';
import { solve } from '../tools/solver.mjs';
import { generate } from '../tools/generate.mjs';

test('指定数だけ、解けていない重複なしの問題を作る', () => {
  const list = generate(6, 5, { seed: 1, maxNodes: 200_000, maxAttempts: 100 });
  assert.equal(list.length, 5);
  const keys = new Set(list.map((p) => JSON.stringify(p.tubes)));
  assert.equal(keys.size, 5);
  for (const p of list) {
    assert.equal(p.tubes.length, 6);
    assert.equal(isSolved(p.tubes), false);
    assert.ok(Number.isInteger(p.optimal) && p.optimal > 0);
    assert.equal(solve(p.tubes), p.optimal);
  }
});

test('同じシードなら同じ結果', () => {
  const opts = { seed: 9, maxNodes: 200_000, maxAttempts: 50 };
  assert.deepEqual(generate(6, 3, opts), generate(6, 3, opts));
});
