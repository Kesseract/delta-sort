import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SATURATION, LIGHTNESS, hslToRgb, makeChain, toCss } from '../site/src/colors.js';

test('hslToRgb の基本色', () => {
  assert.deepEqual(hslToRgb(0, 1, 0.5), [255, 0, 0]);
  assert.deepEqual(hslToRgb(120, 1, 0.5), [0, 255, 0]);
  assert.deepEqual(hslToRgb(240, 1, 0.5), [0, 0, 255]);
  assert.deepEqual(hslToRgb(0, SATURATION, LIGHTNESS), [204, 51, 51]);
});

test('色の鎖は指定した成分だけが1ずつ変わる', () => {
  const chain = makeChain({ hue: 200, channel: 1, count: 8 });
  assert.equal(chain.length, 8);
  const base = hslToRgb(200, SATURATION, LIGHTNESS);
  assert.deepEqual(chain[0], base);
  chain.forEach((c, i) => {
    assert.equal(c[0], base[0]);
    assert.equal(c[2], base[2]);
    assert.equal(c[1], base[1] + i);
  });
});

test('255を超えるなら逆向きにずらす', () => {
  const chain = makeChain({ hue: 0, channel: 0, count: 60 });
  assert.equal(chain[0][0], 204);
  assert.equal(chain[59][0], 145);
  chain.flat().forEach((v) => assert.ok(v >= 0 && v <= 255));
});

test('toCss', () => {
  assert.equal(toCss([1, 2, 3]), 'rgb(1, 2, 3)');
});
