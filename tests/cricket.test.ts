import {describe, it, expect} from 'vitest';
import {newMatch, applyBall, roll} from '../lib/games/paper-cricket/engine';

describe('Paper Cricket Engine', () => {
  it('initializes a new match with default rules', () => {
    const m = newMatch(12, 2);
    expect(m.innings).toBe(1);
    expect(m.batting).toBe(0);
    expect(m.runs).toEqual([0, 0]);
    expect(m.wickets).toEqual([0, 0]);
    expect(m.balls).toEqual([0, 0]);
    expect(m.done).toBe(false);
    expect(m.winner).toBe(null);
  });

  it('records runs correctly for boundaries and singles', () => {
    let m = newMatch(12, 2);
    m = applyBall(m, 4);
    expect(m.runs[0]).toBe(4);
    expect(m.balls[0]).toBe(1);

    m = applyBall(m, 6);
    expect(m.runs[0]).toBe(10);
    expect(m.balls[0]).toBe(2);

    m = applyBall(m, 0); // Dot ball
    expect(m.runs[0]).toBe(10);
    expect(m.balls[0]).toBe(3);
  });

  it('transitions to 2nd innings when max wickets fall', () => {
    let m = newMatch(12, 2);
    m = applyBall(m, 'W');
    expect(m.innings).toBe(1);
    expect(m.wickets[0]).toBe(1);

    m = applyBall(m, 'W');
    expect(m.innings).toBe(2);
    expect(m.batting).toBe(1);
  });

  it('finishes match when target is successfully chased in 2nd innings', () => {
    let m = newMatch(12, 2);
    // 1st innings: scores 10 runs
    m = applyBall(m, 6);
    m = applyBall(m, 4);
    m = applyBall(m, 'W');
    m = applyBall(m, 'W'); // Innings 1 ends with 10 runs

    expect(m.innings).toBe(2);
    expect(m.runs[0]).toBe(10);

    // 2nd innings: Team 2 scores 6, then 6 -> 12 runs > 10 runs
    m = applyBall(m, 6);
    expect(m.done).toBe(false);

    m = applyBall(m, 6);
    expect(m.done).toBe(true);
    expect(m.winner).toBe(1);
  });

  it('roll produces a valid configured outcome', () => {
    const validOutcomes = [0, 1, 2, 3, 4, 6, 'W'];
    for (let i = 0; i < 50; i++) {
      const outcome = roll();
      expect(validOutcomes).toContain(outcome);
    }
  });
});
