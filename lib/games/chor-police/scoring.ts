import type {Role} from './roles';

export const BASE_POINTS: Record<Role, number> = {
  raja: 1000,
  mantri: 800,
  police: 500,
  chor: 0,
};

export function calculateRoundScores(roles: Role[], accusedIndex: number): number[] {
  const isChorCaught = roles[accusedIndex] === 'chor';

  return roles.map(r => {
    if (r === 'raja') return BASE_POINTS.raja;
    if (r === 'mantri') return BASE_POINTS.mantri;
    if (r === 'police') return isChorCaught ? BASE_POINTS.police : 0;
    if (r === 'chor') return isChorCaught ? 0 : BASE_POINTS.police;
    return 0;
  });
}
