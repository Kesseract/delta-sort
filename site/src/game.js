import { CAPACITY, canPour, pour } from './rules.js';

const clone = (tubes) => tubes.map((t) => t.slice());

export function newGame(tubes, { mixed = false } = {}) {
  const initial = clone(tubes);
  return { initial, tubes: clone(initial), history: [], selected: null, mixed };
}

// 試験管 i を押したときの次の状態。
export function tap(state, i) {
  const { tubes, selected } = state;
  if (selected === null) return tubes[i].length > 0 ? { ...state, selected: i } : state;
  if (selected === i) return { ...state, selected: null };
  if (canPour(tubes, selected, i, CAPACITY, state.mixed)) {
    return { ...state, tubes: pour(tubes, selected, i, CAPACITY, state.mixed), history: [...state.history, tubes], selected: null };
  }
  return { ...state, selected: tubes[i].length > 0 ? i : null };
}

export function undo(state) {
  if (state.history.length === 0) return state;
  return {
    ...state,
    tubes: state.history[state.history.length - 1],
    history: state.history.slice(0, -1),
    selected: null,
  };
}

export function restart(state) {
  return { ...state, tubes: clone(state.initial), history: [], selected: null };
}

export const moveCount = (state) => state.history.length;
