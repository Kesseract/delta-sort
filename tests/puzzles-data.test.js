import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAPACITY, EMPTY_TUBES, isSolved } from '../site/src/rules.js';
import { TUBE_OPTIONS } from '../site/src/settings.js';
import { solve } from '../tools/solver.mjs';

const data = JSON.parse(readFileSync(new URL('../site/puzzles.json', import.meta.url), 'utf8'));

test('すべての本数に問題がある', () => {
  for (const n of TUBE_OPTIONS) assert.ok(data[String(n)]?.length > 0, `${n}本`);
});

test('各問題の形が正しい', () => {
  for (const n of TUBE_OPTIONS) {
    for (const p of data[String(n)]) {
      assert.equal(p.tubes.length, n);
      assert.equal(isSolved(p.tubes), false);
      assert.ok(Number.isInteger(p.optimal) && p.optimal > 0);
      assert.ok(Number.isInteger(p.optimalHard) && p.optimalHard > 0 && p.optimalHard <= p.optimal);
      const counts = new Map();
      p.tubes.flat().forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1));
      assert.equal(counts.size, n - EMPTY_TUBES);
      counts.forEach((k) => assert.equal(k, CAPACITY));
      p.tubes.forEach((t) => assert.ok(t.length <= CAPACITY));
    }
  }
});

test('6本の先頭10問は最短手数を再計算して一致する', () => {
  for (const p of data['6'].slice(0, 10)) {
    assert.equal(solve(p.tubes), p.optimal);
    assert.equal(solve(p.tubes, { mixed: true }), p.optimalHard);
  }
});
