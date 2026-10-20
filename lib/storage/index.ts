import type {Summary} from '../types';
export const getPref=<T,>(k:string,d:T):T=>{try{const v=localStorage.getItem('kb:'+k);return v?JSON.parse(v):d}catch{return d}};
export const setPref=(k:string,v:unknown)=>{try{localStorage.setItem('kb:'+k,JSON.stringify(v))}catch{}};
const open=()=>new Promise<IDBDatabase>((res,rej)=>{const r=indexedDB.open('khelabela',1);r.onupgradeneeded=()=>r.result.createObjectStore('matches',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
export async function saveMatch(m:Summary){try{const d=await open();d.transaction('matches','readwrite').objectStore('matches').put(m)}catch{}}
export async function listMatches():Promise<Summary[]>{try{const d=await open();return await new Promise(res=>{const q=d.transaction('matches').objectStore('matches').getAll();q.onsuccess=()=>res((q.result as Summary[]).filter(x=>x&&x.id&&x.game).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8));q.onerror=()=>res([])})}catch{return[]}}
