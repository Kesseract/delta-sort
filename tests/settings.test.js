import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TUBE_OPTIONS, DEFAULT_SETTINGS, loadSettings, saveSettings } from '../site/src/settings.js';

const memory = (init = {}) => {
  const data = { ...init };
  return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, data };
};

test('初期値', () => {
  assert.deepEqual(TUBE_OPTIONS, [6, 8, 10, 12, 14]);
  assert.deepEqual(DEFAULT_SETTINGS, { tubes: 10, hue: null, showAnswer: true, highlight: false, hard: false });
  assert.deepEqual(loadSettings(memory()), DEFAULT_SETTINGS);
  assert.deepEqual(loadSettings(null), DEFAULT_SETTINGS);
});

test('保存したものを読める', () => {
  const s = memory();
  const saved = { tubes: 14, hue: 123, showAnswer: false, highlight: true, hard: true };
  saveSettings(s, saved);
  assert.deepEqual(loadSettings(s), saved);
});

test('壊れた値は項目ごとに初期値へ戻す', () => {
  const s = memory({ 'delta-sort/settings': JSON.stringify({ tubes: 7, hue: 400, showAnswer: 'yes', highlight: 1, hard: 'yes' }) });
  assert.deepEqual(loadSettings(s), DEFAULT_SETTINGS);
  const broken = memory({ 'delta-sort/settings': '{' });
  assert.deepEqual(loadSettings(broken), DEFAULT_SETTINGS);
});

test('ストレージが例外を投げても止まらない', () => {
  const bad = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
  assert.deepEqual(loadSettings(bad), DEFAULT_SETTINGS);
  assert.doesNotThrow(() => saveSettings(bad, DEFAULT_SETTINGS));
});
