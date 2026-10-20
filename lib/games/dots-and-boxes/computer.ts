import type {Diff} from '../../types';
import {DB,legal} from './engine';
import {completing,isSafe,sacrificeCost} from './strategy';
const pick=<T,>(a:T[],rnd:()=>number)=>a[Math.floor(rnd()*a.length)];
export function pickMove(s:DB,d:Diff,rnd=Math.random):number{
 const all=legal(s);const take=completing(s);
 if(d==='easy')return take>=0&&rnd()<0.5?take:pick(all,rnd);
 if(take>=0)return take;
 const safe=all.filter(i=>isSafe(s,i));if(safe.length)return pick(safe,rnd);
 if(d==='medium')return pick(all,rnd);
 const costs=all.map(i=>sacrificeCost(s,i));const m=Math.min(...costs);return pick(all.filter((_,k)=>costs[k]===m),rnd)}
