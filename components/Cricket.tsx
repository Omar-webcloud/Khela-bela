'use client';
import {useEffect,useRef,useState} from 'react';
import {t} from '@/lib/i18n';import type {GameProps} from '@/lib/types';
import {newMatch,roll,applyBall,Outcome} from '@/lib/games/paper-cricket/engine';
export default function Cricket({lang,mode,onExit,onDone}:GameProps){
 const T=(k:string)=>t(lang,k);
 const [m,setM]=useState(newMatch());const [spin,setSpin]=useState(false);const [last,setLast]=useState<Outcome|null>(null);const saved=useRef(false);
 const names=[T('you'),mode==='computer'?T('computer'):'P2'];
 const cpuTurn=mode==='computer'&&m.batting===1;
 const go=()=>{if(spin||m.done)return;setSpin(true);const o=roll();setTimeout(()=>{setM(x=>applyBall(x,o));setLast(o);setSpin(false)},700)};
 useEffect(()=>{if(cpuTurn&&!m.done&&!spin){const id=setTimeout(go,900);return()=>clearTimeout(id)}});
 useEffect(()=>{if(m.done&&!saved.current){saved.current=true;onDone({id:Date.now()+'',game:'cricket',mode,date:new Date().toISOString(),result:`${m.runs[0]}/${m.wickets[0]} - ${m.runs[1]}/${m.wickets[1]}`})}},[m.done]);
 const win=m.winner==='tie'?T('tie'):m.winner!==null?`${names[m.winner]} ${T('wins')}`:'';
 return(<div className="space-y-3"><button className="btn2" onClick={onExit}>← {T('back')}</button>
 <h2 className="text-xl font-bold">{T('cricket')}</h2>
 <div className="grid grid-cols-2 gap-2">{[0,1].map(i=><div key={i} className={'card '+(m.batting===i&&!m.done?'ring-2 ring-emerald-600':'')}><b>{names[i]}</b><div className="text-3xl">{m.runs[i]}/{m.wickets[i]}</div><div className="text-sm">{T('balls')} {m.balls[i]}/{m.maxBalls}</div></div>)}</div>
 {m.innings===2&&<p>{T('target')}: {m.runs[0]+1}</p>}
 <div className="card text-center"><div className={'mx-auto h-16 w-3 rounded bg-blue-700 '+(spin?'animate-spin':'')}/><div className="mt-2 text-4xl font-bold">{spin?'…':last??'–'}</div>
 {!m.done&&<button className="btn mt-3" disabled={spin||cpuTurn} onClick={go}>{T('spin')} ({names[m.batting]})</button>}</div>
 <div className="flex flex-wrap gap-1">{m.log.map((o,i)=><span key={i} className="rounded bg-emerald-100 px-2">{o}</span>)}</div>
 {m.done&&<div className="card text-center"><p className="text-2xl font-bold">{win}</p><button className="btn mt-2" onClick={()=>{saved.current=false;setM(newMatch());setLast(null)}}>{T('rematch')}</button></div>}</div>)}
