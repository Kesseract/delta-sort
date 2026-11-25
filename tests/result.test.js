import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankOf, formatTime } from '../site/src/result.js';

test('ランクの境目', () => {
  assert.equal(rankOf(20, 20), 'S');
  assert.equal(rankOf(23, 20), 'A');
  assert.equal(rankOf(24, 20), 'B');
  assert.equal(rankOf(28, 20), 'B');
  assert.equal(rankOf(29, 20), 'C');
});

test('時間の表示', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(61_500), '01:01');
  assert.equal(formatTime(3_600_000), '60:00');
});
