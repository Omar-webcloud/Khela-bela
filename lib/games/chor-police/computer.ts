import type {Diff} from '../../types';
// The Police does not know who holds which hidden role, so only public history is used.
export function computerGuess(police:number,difficulty:Diff,chorHistory:number[],rnd=Math.random):number{
 const c=[0,1,2,3].filter(i=>i!==police);
 if(difficulty==='easy')return c[Math.floor(rnd()*c.length)];
 if(difficulty==='medium'){const w=c.map(i=>chorHistory[i]+1);let x=rnd()*w.reduce((a,b)=>a+b,0);for(let k=0;k<c.length;k++){x-=w[k];if(x<0)return c[k]}return c[0]}
 const max=Math.max(...c.map(i=>chorHistory[i]));const top=c.filter(i=>chorHistory[i]===max);return top[Math.floor(rnd()*top.length)]}
