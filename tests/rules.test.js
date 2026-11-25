import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAPACITY, EMPTY_TUBES, canPour, pour, isSolved, topRunLength } from '../site/src/rules.js';

test('定数', () => {
  assert.equal(CAPACITY, 4);
  assert.equal(EMPTY_TUBES, 2);
});

test('空の試験管には注げる', () => {
  assert.equal(canPour([[0, 1], []], 0, 1), true);
});

test('同じ色の上には注げ、違う色の上には注げない', () => {
  assert.equal(canPour([[0, 1], [2, 1]], 0, 1), true);
  assert.equal(canPour([[0, 1], [2, 0]], 0, 1), false);
});

test('満杯・空・同じ試験管には注げない', () => {
  assert.equal(canPour([[0], [1, 1, 1, 0]], 0, 1), false);
  assert.equal(canPour([[], [1]], 0, 1), false);
  assert.equal(canPour([[0, 1], []], 0, 0), false);
});

test('同じ色が続く分を入るだけまとめて注ぐ', () => {
  assert.deepEqual(pour([[0, 1, 1, 1], [2, 1]], 0, 1), [[0, 1], [2, 1, 1, 1]]);
  assert.deepEqual(pour([[0, 1, 1], []], 0, 1), [[0], [1, 1]]);
});

test('pour は元の盤面を変更しない', () => {
  const tubes = [[0, 1], []];
  pour(tubes, 0, 1);
  assert.deepEqual(tubes, [[0, 1], []]);
});

test('注げないとき pour は null', () => {
  assert.equal(pour([[0, 1], [2, 0]], 0, 1), null);
});

test('クリア判定', () => {
  assert.equal(isSolved([[0, 0, 0, 0], [1, 1, 1, 1], []]), true);
  assert.equal(isSolved([[0, 0, 0], [1, 1, 1, 1], [0]]), false);
  assert.equal(isSolved([[0, 0, 1, 0], [1, 1, 1, 0], []]), false);
});

test('ハードでは違う色の上にも注げる', () => {
  assert.equal(canPour([[0, 1], [2, 0]], 0, 1, CAPACITY, true), true);
  assert.deepEqual(pour([[0, 1, 1], [2]], 0, 1, CAPACITY, true), [[0], [2, 1, 1]]);
  assert.deepEqual(pour([[0, 1, 1, 1], [2, 3]], 0, 1, CAPACITY, true), [[0, 1], [2, 3, 1, 1]]);
});

test('ハードでも満杯・空・同じ試験管には注げない', () => {
  assert.equal(canPour([[0], [1, 1, 1, 0]], 0, 1, CAPACITY, true), false);
  assert.equal(canPour([[], [1]], 0, 1, CAPACITY, true), false);
  assert.equal(canPour([[0, 1], []], 0, 0, CAPACITY, true), false);
});

test('一番上から続く同じ色の数', () => {
  assert.equal(topRunLength([]), 0);
  assert.equal(topRunLength([0]), 1);
  assert.equal(topRunLength([0, 1, 1]), 2);
  assert.equal(topRunLength([2, 2, 2, 2]), 4);
});
