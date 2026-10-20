import {DB,legal,play,boxSides,sideCount} from './engine';
export const boxesOf=(s:DB,i:number)=>{const r:number[]=[];for(let b=0;b<s.R*s.C;b++)if(boxSides(s.R,s.C,Math.floor(b/s.C),b%s.C).includes(i))r.push(b);return r};
export const completing=(s:DB)=>legal(s).find(i=>boxesOf(s,i).some(b=>s.owner[b]===null&&sideCount(s,b)===3))??-1;
export const isSafe=(s:DB,i:number)=>boxesOf(s,i).every(b=>s.owner[b]!==null||sideCount(s,b)<2);
export function sacrificeCost(s:DB,i:number){let t=play(s,i);if(t.turn===s.turn)return 0;const me=t.turn;
 while(!t.done&&t.turn===me){const m=completing(t);if(m<0)break;t=play(t,m)}return t.scores[me]-s.scores[me]}
