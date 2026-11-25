import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickIndex } from '../site/src/puzzles.js';

test('1問しかなければ0', () => {
  assert.equal(pickIndex(1, 0, () => 0.9), 0);
});

test('直前がなければ全範囲から選ぶ', () => {
  assert.equal(pickIndex(5, null, () => 0), 0);
  assert.equal(pickIndex(5, null, () => 0.999), 4);
});

test('直前と同じ番号は選ばない', () => {
  for (let r = 0; r < 1; r += 0.01) {
    const i = pickIndex(5, 2, () => r);
    assert.notEqual(i, 2);
    assert.ok(i >= 0 && i < 5);
  }
});
