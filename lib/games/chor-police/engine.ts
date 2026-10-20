import {ROLES, Role, ROLE_DETAILS} from './roles';
import {BASE_POINTS, calculateRoundScores} from './scoring';

export {ROLES, ROLE_DETAILS, BASE_POINTS};
export type {Role};

export const POINTS = BASE_POINTS;

export function dealRoles(rnd = Math.random): Role[] {
  const a = [...ROLES];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const candidates = (roles: Role[]): number[] =>
  [0, 1, 2, 3].filter(i => roles[i] !== 'police');

export function scoreRound(roles: Role[], guess: number): number[] {
  if (!candidates(roles).includes(guess)) {
    throw new Error('invalid guess');
  }
  return calculateRoundScores(roles, guess);
}
