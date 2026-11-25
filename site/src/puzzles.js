// 0〜count-1 から、直前（previous）と違う番号を選ぶ。
export function pickIndex(count, previous, rand = Math.random) {
  if (count <= 1) return 0;
  if (previous === null || previous < 0 || previous >= count) return Math.floor(rand() * count);
  const i = Math.floor(rand() * (count - 1));
  return i >= previous ? i + 1 : i;
}
