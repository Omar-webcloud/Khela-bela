import type {Outcome} from './engine';

export interface CricketRules {
  maxBalls: number;
  maxWickets: number;
}

export const DEFAULT_CRICKET_RULES: CricketRules = {
  maxBalls: 12, // 2 overs
  maxWickets: 2,
};

export const OUTCOMES: Outcome[] = [0, 1, 2, 3, 4, 6, 'W'];

/**
 * Standard probability weights for Paper Cricket.
 * Notice: 6s and 4s have realistic schoolyard cricket frequencies,
 * and difficulty MUST NEVER alter these probabilities according to the PRD.
 */
export const OUTCOME_WEIGHTS = [20, 25, 15, 5, 15, 8, 12];
