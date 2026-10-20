import {OUTCOMES, OUTCOME_WEIGHTS, DEFAULT_CRICKET_RULES} from './rules';

export type Outcome = 0 | 1 | 2 | 3 | 4 | 6 | 'W';
export {OUTCOMES};
export const WEIGHTS = OUTCOME_WEIGHTS;

export interface Match {
  innings: 1 | 2;
  batting: 0 | 1;
  runs: [number, number];
  wickets: [number, number];
  balls: [number, number];
  log: Outcome[];
  maxBalls: number;
  maxWickets: number;
  done: boolean;
  winner: 0 | 1 | 'tie' | null;
}

export const newMatch = (
  maxBalls = DEFAULT_CRICKET_RULES.maxBalls,
  maxWickets = DEFAULT_CRICKET_RULES.maxWickets
): Match => ({
  innings: 1,
  batting: 0,
  runs: [0, 0],
  wickets: [0, 0],
  balls: [0, 0],
  log: [],
  maxBalls,
  maxWickets,
  done: false,
  winner: null,
});

export function roll(rnd = Math.random, w = WEIGHTS): Outcome {
  let x = rnd() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i++) {
    x -= w[i];
    if (x < 0) return OUTCOMES[i];
  }
  return OUTCOMES[w.length - 1];
}

export function applyBall(m: Match, o: Outcome): Match {
  if (m.done) return m;
  const b = m.batting;
  const runs = [...m.runs] as [number, number];
  const wickets = [...m.wickets] as [number, number];
  const balls = [...m.balls] as [number, number];

  if (o === 'W') {
    wickets[b]++;
  } else {
    runs[b] += o;
  }
  balls[b]++;

  const n: Match = {
    ...m,
    runs,
    wickets,
    balls,
    log: [...m.log, o],
  };

  const over = balls[b] >= m.maxBalls || wickets[b] >= m.maxWickets;

  if (m.innings === 1) {
    if (over) {
      n.innings = 2;
      n.batting = 1;
      n.log = [];
    }
  } else {
    // 2nd innings ends if target reached or over/wickets expired
    const targetChased = runs[1] > runs[0];
    if (over || targetChased) {
      n.done = true;
      if (runs[1] > runs[0]) {
        n.winner = 1;
      } else if (runs[1] < runs[0]) {
        n.winner = 0;
      } else {
        n.winner = 'tie';
      }
    }
  }

  return n;
}
