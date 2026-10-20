'use client';
import {useEffect,useState} from 'react';
import {Lang,t} from '@/lib/i18n';import type {Mode,Diff,Summary} from '@/lib/types';
import {getPref,setPref,saveMatch,listMatches} from '@/lib/storage';
import Cricket from '@/components/Cricket';import ChorPolice from '@/components/ChorPolice';import Dots from '@/components/Dots';
export default function Home(){
 const [lang,setLang]=useState<Lang>('en');const [mode,setMode]=useState<Mode>('computer');const [diff,setDiff]=useState<Diff>('medium');
 const [game,setGame]=useState<string|null>(null);const [hist,setHist]=useState<Summary[]>([]);
 useEffect(()=>{setLang(getPref('lang','en'));setDiff(getPref('diff','medium'));listMatches().then(setHist)},[]);
 const T=(k:string)=>t(lang,k);
 const done=async(s:Summary)=>{await saveMatch(s);setHist(await listMatches())};
 const p={lang,mode,difficulty:diff,onExit:()=>setGame(null),onDone:done};
 if(game==='cricket')return<Cricket {...p}/>;if(game==='chor')return<ChorPolice {...p}/>;if(game==='dots')return<Dots {...p}/>;
 const seg=<V extends string>(opts:V[],val:V,set:(v:V)=>void,lab:(v:V)=>string)=><div className="flex gap-2">{opts.map(o=><button key={o} className={val===o?'btn':'btn2'} onClick={()=>set(o)}>{lab(o)}</button>)}</div>;
 return(<div className="space-y-4">
 <div className="flex items-center justify-between"><h1 className="text-3xl font-bold text-emerald-800">KhelaBela</h1>
  <button className="btn2" onClick={()=>{const l=lang==='en'?'bn':'en';setLang(l);setPref('lang',l)}}>{lang==='en'?'বাংলা':'English'}</button></div>
 <p>{T('tagline')}</p>
 <div className="card space-y-2"><b>{T('mode')}</b>{seg<Mode>(['computer','local'],mode,setMode,v=>T(v))}
  <b>{T('difficulty')}</b>{seg<Diff>(['easy','medium','hard'],diff,v=>{setDiff(v);setPref('diff',v)},v=>T(v))}</div>
 {[['cricket','🏏'],['chor','👑'],['dots','▦']].map(([g,e])=><button key={g} className="card w-full text-left text-xl font-semibold" onClick={()=>setGame(g)}>{e} {T(g)}</button>)}
 <div className="card"><b>{T('history')}</b>{hist.length?hist.map(h=><div key={h.id} className="flex justify-between text-sm"><span>{T(h.game==='cricket'?'cricket':h.game==='chor'?'chor':'dots')}</span><span>{h.result}</span></div>):<p className="text-sm">{T('none')}</p>}</div>
 <p className="text-xs text-gray-600">{T('offline')}</p></div>)}
