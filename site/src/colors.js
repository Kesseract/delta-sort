export const SATURATION = 0.6;
export const LIGHTNESS = 0.5;

// h: 0〜360、s・l: 0〜1。[r, g, b]（0〜255の整数）を返す。
export function hslToRgb(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

// channel（0=R, 1=G, 2=B）だけを1ずつずらした count 色。255を超えるなら−1ずつ。
export function makeChain({ hue, channel, count }) {
  const base = hslToRgb(hue, SATURATION, LIGHTNESS);
  const dir = base[channel] + (count - 1) <= 255 ? 1 : -1;
  return Array.from({ length: count }, (_, i) => {
    const c = base.slice();
    c[channel] += dir * i;
    return c;
  });
}

export const toCss = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;
