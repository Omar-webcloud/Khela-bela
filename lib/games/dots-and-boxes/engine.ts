export interface DB {
  R: number;
  C: number;
  lines: boolean[];
  lineOwners?: (0 | 1 | null)[];
  owner: (0 | 1 | null)[];
  turn: 0 | 1;
  scores: [number, number];
  done: boolean;
}

export const hIdx = (C: number, r: number, c: number) => r * C + c;
export const vIdx = (R: number, C: number, r: number, c: number) =>
  (R + 1) * C + r * (C + 1) + c;

export const boxSides = (R: number, C: number, r: number, c: number) => [
  hIdx(C, r, c),
  hIdx(C, r + 1, c),
  vIdx(R, C, r, c),
  vIdx(R, C, r, c + 1),
];

export const newGame = (R = 4, C = 4): DB => ({
  R,
  C,
  lines: Array((R + 1) * C + R * (C + 1)).fill(false),
  lineOwners: Array((R + 1) * C + R * (C + 1)).fill(null),
  owner: Array(R * C).fill(null),
  turn: 0,
  scores: [0, 0],
  done: false,
});

export const legal = (s: DB) =>
  s.lines.map((x, i) => (x ? -1 : i)).filter(i => i >= 0);

export const sideCount = (s: DB, b: number) =>
  boxSides(s.R, s.C, Math.floor(b / s.C), b % s.C).filter(i => s.lines[i]).length;

export function play(s: DB, i: number): DB {
  if (s.done || s.lines[i]) throw new Error('illegal move');
  const lines = [...s.lines];
  lines[i] = true;

  const lineOwners: (0 | 1 | null)[] = s.lineOwners
    ? [...s.lineOwners]
    : Array(lines.length).fill(null);
  lineOwners[i] = s.turn;

  const owner = [...s.owner];
  const scores: [number, number] = [...s.scores];
  let n = 0;

  for (let b = 0; b < owner.length; b++) {
    if (
      owner[b] === null &&
      boxSides(s.R, s.C, Math.floor(b / s.C), b % s.C).every(k => lines[k])
    ) {
      owner[b] = s.turn;
      n++;
    }
  }

  scores[s.turn] += n;

  return {
    ...s,
    lines,
    lineOwners,
    owner,
    scores,
    turn: n ? s.turn : ((1 - s.turn) as 0 | 1),
    done: owner.every(o => o !== null),
  };
}
