'use client';
import {useEffect,useRef,useState} from 'react';
import {t} from '@/lib/i18n';import type {GameProps} from '@/lib/types';
import {newGame,play,boxSides} from '@/lib/games/dots-and-boxes/engine';
import {pickMove} from '@/lib/games/dots-and-boxes/computer';
const G=70,P=20;
export default function Dots({lang,mode,difficulty,onExit,onDone}:GameProps){
 const T=(k:string)=>t(lang,k);const [s,setS]=useState(newGame());const saved=useRef(false);
 const names=[T('you'),mode==='computer'?T('computer'):'P2'];const cpu=mode==='computer'&&s.turn===1;
 useEffect(()=>{if(cpu&&!s.done){const id=setTimeout(()=>setS(x=>play(x,pickMove(x,difficulty))),500);return()=>clearTimeout(id)}},[s,cpu]);
 useEffect(()=>{if(s.done&&!saved.current){saved.current=true;onDone({id:Date.now()+'',game:'dots',mode,date:new Date().toISOString(),result:`${s.scores[0]} - ${s.scores[1]}`})}},[s.done]);
 const H=(s.R+1)*s.C;const W=s.C*G+2*P,Ht=s.R*G+2*P;
 const seg=(i:number)=>{if(i<H){const r=Math.floor(i/s.C),c=i%s.C;return[P+c*G,P+r*G,P+(c+1)*G,P+r*G]}const j=i-H,r=Math.floor(j/(s.C+1)),c=j%(s.C+1);return[P+c*G,P+r*G,P+c*G,P+(r+1)*G]};
 const win=s.scores[0]===s.scores[1]?T('tie'):`${names[s.scores[0]>s.scores[1]?0:1]} ${T('wins')}`;
 return(<div className="space-y-3"><button className="btn2" onClick={onExit}>← {T('back')}</button>
 <h2 className="text-xl font-bold">{T('dots')}</h2>
 <div className="flex justify-between"><b className={s.turn===0&&!s.done?'text-emerald-700':''}>{names[0]}: {s.scores[0]}</b><b className={s.turn===1&&!s.done?'text-emerald-700':''}>{names[1]}: {s.scores[1]}</b></div>
 <svg viewBox={`0 0 ${W} ${Ht}`} className="w-full rounded-xl bg-white shadow">
 {s.owner.map((o,b)=>{if(o===null)return null;const r=Math.floor(b/s.C),c=b%s.C;return<g key={b}><rect x={P+c*G+3} y={P+r*G+3} width={G-6} height={G-6} fill={o===0?'#a7f3d0':'#fecaca'}/><text x={P+c*G+G/2} y={P+r*G+G/2+6} textAnchor="middle">{o===0?'A':'B'}</text></g>})}
 {s.lines.map((on,i)=>{const [x1,y1,x2,y2]=seg(i);return<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={on?'#065f46':'#e5e7eb'} strokeWidth={on?5:3} strokeLinecap="round"/>
  {!on&&!cpu&&!s.done&&<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={26} style={{cursor:'pointer'}} onClick={()=>setS(play(s,i))}/>}</g>})}
 {Array.from({length:(s.R+1)*(s.C+1)},(_,k)=><circle key={k} cx={P+(k%(s.C+1))*G} cy={P+Math.floor(k/(s.C+1))*G} r={5} fill="#111827"/>)}</svg>
 {s.done&&<div className="card text-center"><p className="text-2xl font-bold">{win}</p><button className="btn mt-2" onClick={()=>{saved.current=false;setS(newGame())}}>{T('rematch')}</button></div>}</div>)}
