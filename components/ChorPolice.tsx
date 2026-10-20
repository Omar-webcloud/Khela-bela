'use client';
import {useEffect,useState} from 'react';
import {t} from '@/lib/i18n';import type {GameProps} from '@/lib/types';
import {dealRoles,scoreRound,candidates,Role} from '@/lib/games/chor-police/engine';
import {computerGuess} from '@/lib/games/chor-police/computer';
const ROUNDS=5;
export default function ChorPolice({lang,mode,difficulty,onExit,onDone}:GameProps){
 const T=(k:string)=>t(lang,k);
 const names=mode==='computer'?[T('you'),'CPU 1','CPU 2','CPU 3']:['P1','P2','P3','P4'];
 const humans=mode==='computer'?[0]:[0,1,2,3];
 const rn=(r:Role)=>T(r==='chor'?'chorR':r);
 const [round,setRound]=useState(1);const [roles,setRoles]=useState<Role[]>(()=>dealRoles());
 const [phase,setPhase]=useState<'reveal'|'guess'|'result'>('reveal');const [step,setStep]=useState(0);const [shown,setShown]=useState(false);
 const [total,setTotal]=useState([0,0,0,0]);const [chors,setChors]=useState([0,0,0,0]);const [gain,setGain]=useState<number[]>([]);const [picked,setPicked]=useState(-1);
 const police=roles.indexOf('police');
 const guess=(g:number)=>{const p=scoreRound(roles,g);setPicked(g);setGain(p);setTotal(x=>x.map((v,i)=>v+p[i]));setChors(c=>c.map((v,i)=>v+(roles[i]==='chor'?1:0)));setPhase('result')};
 useEffect(()=>{if(phase==='guess'&&!humans.includes(police)){const id=setTimeout(()=>guess(computerGuess(police,difficulty,chors)),900);return()=>clearTimeout(id)}},[phase]);
 const hide=()=>{setShown(false);if(step+1<humans.length)setStep(step+1);else setPhase('guess')};
 const next=()=>{setRoles(dealRoles());setRound(round+1);setPhase('reveal');setStep(0);setShown(false);setPicked(-1)};
 const best=total.indexOf(Math.max(...total));
 const finish=()=>{onDone({id:Date.now()+'',game:'chor',mode,date:new Date().toISOString(),result:`${names[best]} (${total[best]})`});onExit()};
 return(<div className="space-y-3"><button className="btn2" onClick={onExit}>← {T('back')}</button>
 <h2 className="text-xl font-bold">{T('chor')} — {T('round')} {round}/{ROUNDS}</h2>
 <div className="card">{names.map((n,i)=><div key={i} className="flex justify-between"><span>{n}</span><b>{total[i]}</b></div>)}</div>
 {phase==='reveal'&&<div className="card text-center"><p>{T('passTo')} <b>{names[humans[step]]}</b></p>
  {shown?<><p className="my-3 text-4xl font-bold">{rn(roles[humans[step]])}</p><button className="btn" onClick={hide}>{T('hide')}</button></>:<button className="btn mt-3" onClick={()=>setShown(true)}>{T('show')}</button>}</div>}
 {phase==='guess'&&<div className="card text-center"><p>{T('police')}: <b>{names[police]}</b></p>
  {humans.includes(police)?<><p className="my-2">{T('guess')}</p><div className="flex flex-wrap justify-center gap-2">{candidates(roles).map(i=><button key={i} className="btn" onClick={()=>guess(i)}>{names[i]}</button>)}</div></>:<p className="my-3">…</p>}</div>}
 {phase==='result'&&<div className="card"><p className="font-bold">{roles[picked]==='chor'?T('caught'):T('missed')}</p>
  {names.map((n,i)=><div key={i} className="flex justify-between"><span>{n} — {rn(roles[i])}</span><b>+{gain[i]}</b></div>)}
  {round<ROUNDS?<button className="btn mt-3" onClick={next}>{T('next')}</button>:<><p className="mt-2 text-xl font-bold">{names[best]} {T('wins')}</p><button className="btn mt-2" onClick={finish}>{T('finish')}</button></>}</div>}</div>)}
