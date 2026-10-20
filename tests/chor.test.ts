import {describe, it, expect} from 'vitest';
import {dealRoles, scoreRound, candidates, Role} from '../lib/games/chor-police/engine';
import {computerGuess} from '../lib/games/chor-police/computer';

describe('Chor Police Engine', () => {
  it('deals each role exactly once per round', () => {
    const roles = dealRoles();
    expect(roles).toHaveLength(4);
    expect(roles).toContain('raja');
    expect(roles).toContain('mantri');
    expect(roles).toContain('police');
    expect(roles).toContain('chor');
  });

  it('excludes Police from candidate suspects', () => {
    const roles: Role[] = ['raja', 'mantri', 'police', 'chor'];
    const cand = candidates(roles);
    expect(cand).toEqual([0, 1, 3]);
    expect(cand).not.toContain(2);
  });

  it('awards 500 points to Police when Chor is correctly identified', () => {
    const roles: Role[] = ['raja', 'mantri', 'police', 'chor'];
    // Suspect at index 3 is Chor
    const scores = scoreRound(roles, 3);
    expect(scores).toEqual([1000, 800, 500, 0]);
  });

  it('awards 500 points to Chor when Police makes a wrong guess', () => {
    const roles: Role[] = ['raja', 'mantri', 'police', 'chor'];
    // Suspect at index 1 is Mantri (wrong guess)
    const scores = scoreRound(roles, 1);
    expect(scores).toEqual([1000, 800, 0, 500]);
  });

  it('computer Police makes a valid guess from candidates', () => {
    const roles: Role[] = ['raja', 'mantri', 'police', 'chor'];
    const cand = candidates(roles);
    const guess = computerGuess(2, 'medium', [0, 0, 0, 0]);
    expect(cand).toContain(guess);
  });
});
