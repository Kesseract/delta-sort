import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, tap, undo, restart, moveCount } from '../site/src/game.js';

const start = () => newGame([[0, 1], [1, 0], []]);

test('新しいゲームは未選択・0手で、元配列を共有しない', () => {
  const tubes = [[0, 1], []];
  const g = newGame(tubes);
  assert.equal(g.selected, null);
  assert.equal(moveCount(g), 0);
  g.tubes[0].push(9);
  assert.deepEqual(tubes, [[0, 1], []]);
  assert.deepEqual(g.initial, [[0, 1], []]);
});

test('空の試験管は選べない', () => {
  assert.equal(tap(start(), 2).selected, null);
});

test('選んで同じものを押すと選択解除', () => {
  const g = tap(start(), 0);
  assert.equal(g.selected, 0);
  assert.equal(tap(g, 0).selected, null);
});

test('注げる先を押すと注いで1手になる', () => {
  const g = tap(tap(start(), 0), 2);
  assert.deepEqual(g.tubes, [[0], [1, 0], [1]]);
  assert.equal(g.selected, null);
  assert.equal(moveCount(g), 1);
});

test('注げない先を押すとそちらを選び直す', () => {
  const g = tap(tap(start(), 0), 1);
  assert.equal(g.selected, 1);
  assert.equal(moveCount(g), 0);
});

test('取り消しで1手戻り、手数も減る', () => {
  const g = undo(tap(tap(start(), 0), 2));
  assert.deepEqual(g.tubes, [[0, 1], [1, 0], []]);
  assert.equal(moveCount(g), 0);
  assert.equal(g.selected, null);
});

test('取り消す手がなければ何もしない', () => {
  const g = start();
  assert.equal(undo(g), g);
});

test('やり直しで最初の盤面・0手に戻る', () => {
  let g = tap(tap(start(), 0), 2);
  g = tap(tap(g, 1), 0);
  g = restart(g);
  assert.deepEqual(g.tubes, [[0, 1], [1, 0], []]);
  assert.equal(moveCount(g), 0);
});
