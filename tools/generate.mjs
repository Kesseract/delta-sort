import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { EMPTY_TUBES, isSolved } from '../site/src/rules.js';
import { TUBE_OPTIONS } from '../site/src/settings.js';
import { mulberry32, randomPuzzle } from './random.mjs';
import { solve, stateKey } from './solver.mjs';

export function generate(tubeCount, count, { seed, maxNodes, maxAttempts }) {
  const rand = mulberry32(seed);
  const seen = new Set();
  const out = [];
  for (let attempt = 0; out.length < count && attempt < maxAttempts; attempt++) {
    const tubes = randomPuzzle(tubeCount - EMPTY_TUBES, rand);
    if (isSolved(tubes)) continue;
    const key = stateKey(tubes);
    if (seen.has(key)) continue;
    seen.add(key);
    const optimal = solve(tubes, { maxNodes });
    if (optimal === null) continue;
    out.push({ tubes, optimal });
  }
  return out;
}

function parseArgs(argv) {
  const args = { count: 200, maxNodes: 1_000_000, out: 'site/puzzles.json', only: null };
  for (const a of argv) {
    const [k, v] = a.replace(/^--/, '').split('=');
    if (k === 'count') args.count = Number(v);
    if (k === 'max-nodes') args.maxNodes = Number(v);
    if (k === 'out') args.out = v;
    if (k === 'only') args.only = v.split(',').map(Number);
  }
  return args;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  const result = {};
  for (const n of args.only ?? TUBE_OPTIONS) {
    const t0 = Date.now();
    result[String(n)] = generate(n, args.count, {
      seed: n * 1000 + 1,
      maxNodes: args.maxNodes,
      maxAttempts: args.count * 5,
    });
    const list = result[String(n)];
    const opts = list.map((p) => p.optimal);
    console.log(`${n}本: ${list.length}問 最短${Math.min(...opts)}〜${Math.max(...opts)}手 ${((Date.now() - t0) / 1000).toFixed(1)}秒`);
  }
  writeFileSync(args.out, JSON.stringify(result) + '\n');
  console.log(`書き出し: ${args.out}`);
}
