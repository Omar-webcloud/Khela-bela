import type {Diff} from '../../types';
import {roll, Outcome} from './engine';

export interface ComputerCricketAction {
  action: 'spin';
  thinkingDelayMs: number;
}

/**
 * Computer opponent decision logic for Paper Cricket.
 * Determines pacing and reaction without altering outcome probabilities.
 */
export function getComputerCricketAction(difficulty: Diff): ComputerCricketAction {
  let delay = 1000;
  if (difficulty === 'easy') {
    delay = 1400;
  } else if (difficulty === 'hard') {
    delay = 700;
  }
  return {
    action: 'spin',
    thinkingDelayMs: delay,
  };
}

export function computerRollDelivery(): Outcome {
  return roll();
}
