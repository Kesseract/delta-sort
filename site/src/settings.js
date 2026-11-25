export const TUBE_OPTIONS = [6, 8, 10, 12, 14];
export const DEFAULT_SETTINGS = Object.freeze({ tubes: 10, hue: null, showAnswer: true });
const KEY = 'delta-sort/settings';

export function loadSettings(storage) {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const p = JSON.parse(raw);
    return {
      tubes: TUBE_OPTIONS.includes(p.tubes) ? p.tubes : DEFAULT_SETTINGS.tubes,
      hue: Number.isInteger(p.hue) && p.hue >= 0 && p.hue < 360 ? p.hue : null,
      showAnswer: typeof p.showAnswer === 'boolean' ? p.showAnswer : DEFAULT_SETTINGS.showAnswer,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(storage, settings) {
  try {
    storage?.setItem(KEY, JSON.stringify(settings));
  } catch {
    // 保存できない環境（プライベートモード等）では保存しない
  }
}
