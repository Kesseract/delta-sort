import { EMPTY_TUBES, isSolved } from './rules.js';
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
    optimal: list[index].optimal,
    hue,
    colors: makeChain({ hue, channel, count: settings.tubes - EMPTY_TUBES }),
  };
  game = newGame(list[index].tubes);
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
  $('answer-on').classList.toggle('on', settings.showAnswer);
  $('answer-off').classList.toggle('on', !settings.showAnswer);

  const rad = (problem.hue * Math.PI) / 180;
  const knob = $('knob');
  knob.style.left = `${WHEEL_CENTER + KNOB_RADIUS * Math.cos(rad)}px`;
  knob.style.top = `${WHEEL_CENTER + KNOB_RADIUS * Math.sin(rad)}px`;
  knob.style.background = toCss(problem.colors[0]);
}

function update(patch, { regenerate = true } = {}) {
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
  $('answer-on').addEventListener('click', () => update({ showAnswer: true }, { regenerate: false }));
  $('answer-off').addEventListener('click', () => update({ showAnswer: false }, { regenerate: false }));

  $('next').addEventListener('click', () => {
    $('clear').close();
    startProblem();
  });
  // クリア表示は Esc で閉じない（閉じると操作できない盤面だけが残るため）
  $('clear').addEventListener('cancel', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector('dialog[open]')) return;
    const key = e.key.toLowerCase();
    if (key === 'z') onUndo();
    if (key === 'r') onRestart();
  });
}

async function init() {
  const res = await fetch('puzzles.json');
  puzzles = await res.json();
  bindEvents();
  startProblem();
}

init();
