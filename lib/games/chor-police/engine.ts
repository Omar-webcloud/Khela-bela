export const ROLES=['raja','mantri','police','chor'] as const;
export type Role=typeof ROLES[number];
export const POINTS={raja:1000,mantri:800,police:500,chor:0};
export function dealRoles(rnd=Math.random):Role[]{const a=[...ROLES];for(let i=3;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export const candidates=(roles:Role[])=>[0,1,2,3].filter(i=>roles[i]!=='police');
export function scoreRound(roles:Role[],guess:number):number[]{
 if(!candidates(roles).includes(guess))throw new Error('invalid guess');
 const ok=roles[guess]==='chor';
 return roles.map(r=>r==='police'?(ok?500:0):r==='chor'?(ok?0:500):POINTS[r])}
