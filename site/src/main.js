import { EMPTY_TUBES, isSolved, topRunLength } from './rules.js';
import { makeChain, toCss } from './colors.js';
import { rankOf, formatTime } from './result.js';
import { newGame, tap, undo, restart, moveCount } from './game.js';
import { TUBE_OPTIONS, loadSettings, saveSettings } from './settings.js';
import { pickIndex } from './puzzles.js';

const $ = (id) => document.getElementById(id);
const storage = (() => {
  try { return window.localStorage; } catch { return null; }
})();

const WHEEL_CENTER = 90;
const KNOB_RADIUS = 71;
const LAYER_HEIGHT = 36; // style.css の .layer の高さと合わせる
const LAYER_BOTTOM = 3; // style.css の .tube の padding-bottom と合わせる
// オン・オフの2択ボタン（regenerate: 切り替えたら新しい問題にするか）
const TOGGLES = [
  { on: 'answer-on', off: 'answer-off', key: 'showAnswer', regenerate: false },
  { on: 'highlight-on', off: 'highlight-off', key: 'highlight', regenerate: false },
  { on: 'rule-hard', off: 'rule-normal', key: 'hard', regenerate: true },
];

let puzzles = null;
let settings = loadSettings(storage);
let problem = null; // { tubeCount, index, optimal, hue, colors }
let game = null;
let startedAt = null;
let finishedMs = null;
let timerId = null;

const elapsed = () => finishedMs ?? (startedAt === null ? 0 : performance.now() - startedAt);
const solved = () => isSolved(game.tubes);

function updateTime() {
  $('time').textContent = formatTime(elapsed());
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startProblem() {
  const list = puzzles[String(settings.tubes)];
  const previous = problem?.tubeCount === settings.tubes ? problem.index : null;
  const index = pickIndex(list.length, previous);
  const hue = settings.hue ?? Math.floor(Math.random() * 360);
  const channel = Math.floor(Math.random() * 3);
  problem = {
    tubeCount: settings.tubes,
    index,
    optimal: settings.hard ? list[index].optimalHard : list[index].optimal,
    hue,
    colors: makeChain({ hue, channel, count: settings.tubes - EMPTY_TUBES }),
  };
  game = newGame(list[index].tubes, { mixed: settings.hard });
  stopTimer();
  startedAt = null;
  finishedMs = null;
  updateTime();
  render();
}

function finish() {
  finishedMs = elapsed();
  stopTimer();
  updateTime();
  const moves = moveCount(game);
  $('rank').textContent = rankOf(moves, problem.optimal);
  $('clear-moves').textContent = String(moves);
  $('clear-optimal').textContent = String(problem.optimal);
  $('clear-time').textContent = formatTime(finishedMs);
  $('clear').showModal();
}

function onTap(i) {
  if (solved()) return;
  const before = moveCount(game);
  game = tap(game, i);
  if (moveCount(game) > before && startedAt === null) {
    startedAt = performance.now();
    timerId = setInterval(updateTime, 250);
  }
  render();
  if (solved()) finish();
}

function onUndo() {
  if (solved()) return;
  game = undo(game);
  render();
}

function onRestart() {
  if (solved()) return;
  game = restart(game);
  render();
}

// 一番上でつながっている液体の高さに合わせて、試験管の左右に光る線を置く
function addGlow(el, tube) {
  const run = topRunLength(tube);
  for (const side of ['left', 'right']) {
    const bar = document.createElement('span');
    bar.className = `glow ${side}`;
    bar.style.bottom = `${LAYER_BOTTOM + (tube.length - run) * LAYER_HEIGHT}px`;
    bar.style.height = `${run * LAYER_HEIGHT}px`;
    el.append(bar);
  }
}

function render() {
  $('moves').textContent = String(moveCount(game));

  const board = $('board');
  board.replaceChildren();
  game.tubes.forEach((tube, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = game.selected === i ? 'tube selected' : 'tube';
    el.setAttribute('aria-label', `試験管${i + 1}`);
    for (const c of tube) {
      const layer = document.createElement('div');
      layer.className = 'layer';
      layer.style.background = toCss(problem.colors[c]);
      el.append(layer);
    }
    if (settings.highlight && game.selected === i) addGlow(el, tube);
    el.addEventListener('click', () => onTap(i));
    board.append(el);
  });

  const answer = $('answer');
  answer.hidden = !settings.showAnswer;
  answer.replaceChildren();
  problem.colors.forEach((c, i) => {
    if (i > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '→';
      answer.append(arrow);
    }
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.style.background = toCss(c);
    answer.append(chip);
  });

  renderSettings();
}

function renderSettings() {
  const options = $('tube-options');
  options.replaceChildren();
  for (const n of TUBE_OPTIONS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(n);
    b.classList.toggle('on', n === settings.tubes);
    b.addEventListener('click', () => update({ tubes: n }));
    options.append(b);
  }
  $('hue-random').classList.toggle('on', settings.hue === null);
  for (const t of TOGGLES) {
    $(t.on).classList.toggle('on', settings[t.key]);
    $(t.off).classList.toggle('on', !settings[t.key]);
  }

  const rad = (problem.hue * Math.PI) / 180;
  const knob = $('knob');
  knob.style.left = `${WHEEL_CENTER + KNOB_RADIUS * Math.cos(rad)}px`;
  knob.style.top = `${WHEEL_CENTER + KNOB_RADIUS * Math.sin(rad)}px`;
  knob.style.background = toCss(problem.colors[0]);
}

function update(patch, { regenerate = true } = {}) {
  // 今と同じ値を押しただけなら、進行中の問題を消さない
  if (Object.entries(patch).every(([k, v]) => settings[k] === v)) return;
  settings = { ...settings, ...patch };
  saveSettings(storage, settings);
  if (regenerate) startProblem();
  else render();
}

function bindEvents() {
  $('undo').addEventListener('click', onUndo);
  $('restart').addEventListener('click', onRestart);
  $('open-settings').addEventListener('click', () => $('settings').showModal());
  $('close-settings').addEventListener('click', () => $('settings').close());

  $('wheel').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left - WHEEL_CENTER;
    const y = e.clientY - r.top - WHEEL_CENTER;
    const hue = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360) % 360;
    update({ hue });
  });
  $('hue-random').addEventListener('click', () => update({ hue: null }));
  for (const t of TOGGLES) {
    $(t.on).addEventListener('click', () => update({ [t.key]: true }, { regenerate: t.regenerate }));
    $(t.off).addEventListener('click', () => update({ [t.key]: false }, { regenerate: t.regenerate }));
  }

  $('next').addEventListener('click', () => $('clear').close());
  // クリア表示は Esc で閉じない。それでも閉じた場合（ブラウザによっては Esc 連打で閉じる）も、
  // 操作できない解けた盤面を残さず次の問題へ進む
  $('clear').addEventListener('cancel', (e) => e.preventDefault());
  $('clear').addEventListener('close', () => {
    if (solved()) startProblem();
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector('dialog[open]')) return;
    const key = e.key.toLowerCase();
    if (key === 'z') onUndo();
    if (key === 'r') onRestart();
  });
}

async function init() {
  try {
    const res = await fetch('puzzles.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    puzzles = await res.json();
  } catch (err) {
    $('board').textContent = `問題データを読み込めませんでした（${err.message}）。再読み込みしてください。`;
    return;
  }
  bindEvents();
  startProblem();
}

init();
