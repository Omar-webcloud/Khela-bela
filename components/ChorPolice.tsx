'use client';

import React, {useEffect, useRef, useState} from 'react';
import type {GameProps} from '@/lib/types';
import {dealRoles, scoreRound, candidates, Role} from '@/lib/games/chor-police/engine';
import {computerGuess} from '@/lib/games/chor-police/computer';
import {playPaperRustle, playPenClick, playCricketBoundary, playWicket} from '@/lib/audio';

interface RoleCard {
  id: Role;
  name: string;
  points: number;
  emoji: string;
  desc: string;
}

const ROLES_INFO: Record<Role, RoleCard> = {
  raja: {
    id: 'raja',
    name: 'রাজা',
    points: 1000,
    emoji: '👑',
    desc: 'সর্বোচ্চ শাসক। কোনো ঝুঁকি ছাড়াই ১০০০ পয়েন্ট নিশ্চিত।',
  },
  mantri: {
    id: 'mantri',
    name: 'মন্ত্রী',
    points: 800,
    emoji: '📜',
    desc: 'রাজার বিশ্বস্ত পরামর্শক। প্রতি রাউন্ডে ৮০০ পয়েন্ট পান।',
  },
  police: {
    id: 'police',
    name: 'পুলিশ',
    points: 500,
    emoji: '👮',
    desc: 'লুকিয়ে থাকা চোরকে শনাক্ত করতে হবে। সফল হলে ৫০০ পয়েন্ট!',
  },
  chor: {
    id: 'chor',
    name: 'চোর',
    points: 0,
    emoji: '🎭',
    desc: 'পরিচয় গোপন রাখতে হবে। পুলিশ ভুল অনুমান করলে ৫০০ পয়েন্ট চোরের!',
  },
};

export default function ChorPolice({mode, difficulty, houseRules, onExit, onDone}: GameProps) {
  const totalRounds = houseRules?.chorRounds ?? 5;

  // Totally Bengali player names
  const names =
    mode === 'solo'
      ? ['আপনি', 'রোবট ১', 'রোবট ২', 'রোবট ৩']
      : mode === 'computer'
      ? ['আপনি', 'কম্পিউটার ১', 'কম্পিউটার ২', 'কম্পিউটার ৩']
      : ['খেলোয়াড় ১', 'খেলোয়াড় ২', 'খেলোয়াড় ৩', 'খেলোয়াড় ৪'];

  const humanPlayers = mode === 'computer' ? [0] : mode === 'solo' ? [0] : [0, 1, 2, 3];

  const [round, setRound] = useState(1);
  const [roles, setRoles] = useState<Role[]>(() => dealRoles());
  const [phase, setPhase] = useState<'reveal' | 'court' | 'guess' | 'result'>('reveal');
  const [passIndex, setPassIndex] = useState(0);
  const [chitUnfolded, setChitUnfolded] = useState(false);

  const [totalScores, setTotalScores] = useState([0, 0, 0, 0]);
  const [chorHistory, setChorHistory] = useState([0, 0, 0, 0]);
  const [roundGains, setRoundGains] = useState<number[]>([]);
  const [accusedIndex, setAccusedIndex] = useState<number>(-1);
  const [thinking, setThinking] = useState(false);

  const saved = useRef(false);

  const policeIndex = roles.indexOf('police');
  const rajaIndex = roles.indexOf('raja');
  const mantriIndex = roles.indexOf('mantri');
  const chorIndex = roles.indexOf('chor');

  const isHumanPolice = humanPlayers.includes(policeIndex);

  // Toggle paper chit unfold
  const handleToggleChit = () => {
    playPaperRustle();
    setChitUnfolded(!chitUnfolded);
  };

  // Confirm chit seen and advance
  const handleConfirmChit = () => {
    playPaperRustle();
    setChitUnfolded(false);
    if (passIndex + 1 < humanPlayers.length) {
      setPassIndex(passIndex + 1);
    } else {
      setPhase('court');
    }
  };

  // Police makes accusation
  const handleAccusation = (suspectIndex: number) => {
    playPenClick();
    const gains = scoreRound(roles, suspectIndex);
    setAccusedIndex(suspectIndex);
    setRoundGains(gains);
    setTotalScores(prev => prev.map((val, idx) => val + gains[idx]));
    setChorHistory(prev => prev.map((val, idx) => val + (roles[idx] === 'chor' ? 1 : 0)));

    if (roles[suspectIndex] === 'chor') {
      playCricketBoundary(6);
    } else {
      playWicket();
    }

    setPhase('result');
  };

  // Computer Police guess thinking
  useEffect(() => {
    if (phase === 'guess' && !isHumanPolice) {
      setThinking(true);
      const timer = setTimeout(() => {
        setThinking(false);
        const guess = computerGuess(policeIndex, difficulty, chorHistory);
        handleAccusation(guess);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, isHumanPolice, policeIndex, difficulty, chorHistory]);

  const handleNextRound = () => {
    playPaperRustle();
    setRoles(dealRoles());
    setRound(r => r + 1);
    setPhase('reveal');
    setPassIndex(0);
    setChitUnfolded(false);
    setAccusedIndex(-1);
    setRoundGains([]);
  };

  const highestScore = Math.max(...totalScores);
  const winnerIndex = totalScores.indexOf(highestScore);

  const handleFinish = () => {
    if (!saved.current && mode !== 'solo') {
      saved.current = true;
      onDone({
        id: Date.now().toString(),
        game: 'chor',
        mode,
        date: new Date().toISOString(),
        result: `${names[winnerIndex]} (${highestScore} পয়েন্ট)`,
        details: `${totalRounds} রাউন্ড খেলা হয়েছে`,
      });
    }
    onExit();
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-95"
        >
          <span>←</span>
          <span>তালিকায় ফিরুন</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg font-black tracking-tight text-amber-950 sm:text-xl">
            রাজা-মন্ত্রী-চোর-পুলিশ
          </h2>
          <span className="inline-block rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
            রাউন্ড {round}/{totalRounds} • {mode === 'computer' ? 'কম্পিউটার' : mode === 'solo' ? 'অনুশীলন' : 'একসাথে'}
          </span>
        </div>

        <button
          onClick={() => {
            setRound(1);
            setTotalScores([0, 0, 0, 0]);
            setRoles(dealRoles());
            setPhase('reveal');
            setPassIndex(0);
            setChitUnfolded(false);
          }}
          className="flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-95"
          title="আবার খেলুন"
        >
          🔄 আবার খেলুন
        </button>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-4 gap-2 rounded-2xl border border-amber-200 bg-[#fefbf3] p-3 shadow-sm">
        {names.map((n, i) => (
          <div
            key={i}
            className={`rounded-xl border p-2 text-center transition-all ${
              totalScores[i] === highestScore && highestScore > 0
                ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-400 shadow-xs'
                : 'border-stone-200 bg-white'
            }`}
          >
            <div className="truncate text-xs font-bold text-stone-700">{n}</div>
            <div className="text-xl font-black text-stone-900">{totalScores[i]}</div>
            <div className="text-[10px] text-stone-500 font-medium">পয়েন্ট</div>
          </div>
        ))}
      </div>

      {/* PHASE 1: চিরকুট বণ্টন ও গোপন ভূমিকা প্রদর্শন */}
      {phase === 'reveal' && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-300 bg-[#fffdf5] p-6 text-center shadow-md">
          {/* Paper margin line */}
          <div className="pointer-events-none absolute bottom-0 left-6 top-0 w-[2px] bg-red-300/40" />

          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            🔒 সম্পূর্ণ গোপন রাখুন — অন্য কেউ যেন দেখতে না পায়!
          </div>

          <h3 className="text-base font-extrabold text-stone-900 sm:text-lg">
            চিরকুটটি কার কাছে যাবে:{' '}
            <span className="text-emerald-700 underline decoration-2 underline-offset-4">
              {names[humanPlayers[passIndex]]}
            </span>
          </h3>

          <div className="my-6 flex justify-center">
            {/* Folded Paper Chit (চিঠি) */}
            <div
              onClick={handleToggleChit}
              className={`relative h-44 w-60 cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 select-none ${
                chitUnfolded
                  ? 'border-amber-400 bg-white shadow-xl scale-105'
                  : 'border-stone-300 bg-[#fbf5e5] shadow-md hover:-translate-y-1'
              }`}
            >
              {/* Paper Fold Crease Lines */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dashed border-stone-300" />
              <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-r border-dashed border-stone-300" />

              {!chitUnfolded ? (
                <div className="flex h-full flex-col items-center justify-center space-y-2">
                  <span className="text-3xl">✉️</span>
                  <span className="text-sm font-black text-stone-800">
                    কাগজের চিরকুট #{humanPlayers[passIndex] + 1}
                  </span>
                  <span className="rounded-full bg-emerald-700 px-3.5 py-1 text-xs font-bold text-white shadow-xs">
                    খুলতে চাপ দিন 👆
                  </span>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-1 animate-fade-in">
                  <span className="text-4xl">{ROLES_INFO[roles[humanPlayers[passIndex]]].emoji}</span>
                  <span className="text-2xl font-black text-stone-900">
                    {ROLES_INFO[roles[humanPlayers[passIndex]]].name}
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    {ROLES_INFO[roles[humanPlayers[passIndex]]].points} পয়েন্ট
                  </span>
                  <span className="text-[11px] text-stone-600 font-medium leading-tight">
                    {ROLES_INFO[roles[humanPlayers[passIndex]]].desc}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            {chitUnfolded && (
              <button
                onClick={handleConfirmChit}
                className="rounded-2xl bg-emerald-700 px-7 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-800 active:scale-95"
              >
                🔒 চিরকুট ভাঁজ করে এগিয়ে যান
              </button>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2: রাজদরবার — রাজার প্রশ্ন ও মন্ত্রীর উত্তর */}
      {phase === 'court' && (
        <div className="rounded-3xl border border-stone-300 bg-[#fffdf8] p-6 text-center shadow-md space-y-4">
          <div className="text-xs font-black uppercase tracking-wider text-amber-900">
            👑 রাজদরবার প্রস্তুত
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            {/* Raja dialogue */}
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-left shadow-xs flex items-center gap-3">
              <span className="text-3xl">👑</span>
              <div>
                <div className="text-xs font-bold text-amber-900">{names[rajaIndex]} (রাজা)</div>
                <div className="text-sm font-extrabold text-stone-900">
                  "আমার মন্ত্রী কে?"
                </div>
              </div>
            </div>

            {/* Mantri dialogue */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3.5 text-left shadow-xs flex items-center gap-3">
              <span className="text-3xl">📜</span>
              <div>
                <div className="text-xs font-bold text-blue-900">{names[mantriIndex]} (মন্ত্রী)</div>
                <div className="text-sm font-extrabold text-stone-900">
                  "আমি আপনার মন্ত্রী, জাঁহাপনা!"
                </div>
              </div>
            </div>

            {/* Order to find Chor */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-left shadow-xs flex items-center gap-3">
              <span className="text-3xl">👮</span>
              <div>
                <div className="text-xs font-bold text-emerald-900">রাজার হুকুম:</div>
                <div className="text-sm font-extrabold text-stone-900">
                  "পুলিশ! বাকি দুজনের মধ্য থেকে আসল চোরকে খুঁজে বের করো!"
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playPenClick();
              setPhase('guess');
            }}
            className="rounded-2xl bg-emerald-700 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800 active:scale-95"
          >
            👮 চোর ধরতে এগিয়ে যান ➜
          </button>
        </div>
      )}

      {/* PHASE 3: পুলিশ চোর শনাক্তকরণ */}
      {phase === 'guess' && (
        <div className="rounded-3xl border border-stone-300 bg-[#fffdf8] p-6 text-center shadow-md space-y-5">
          <div className="flex items-center justify-center gap-2 text-stone-800">
            <span className="text-3xl">👮</span>
            <div className="text-left">
              <div className="text-xs font-semibold text-stone-500">পুলিশের দায়িত্বে আছেন:</div>
              <div className="text-base font-black text-emerald-800">{names[policeIndex]}</div>
            </div>
          </div>

          <p className="text-sm font-bold text-stone-700">
            কাকে চোর বলে মনে হচ্ছে? সঠিক ব্যক্তিটিকে চিহ্নিত করুন:
          </p>

          {isHumanPolice ? (
            <div className="flex flex-wrap justify-center gap-3">
              {candidates(roles).map(idx => (
                <button
                  key={idx}
                  onClick={() => handleAccusation(idx)}
                  className="flex flex-col items-center gap-1 rounded-2xl border-2 border-stone-300 bg-white p-4 shadow-sm transition-all hover:border-red-500 hover:bg-red-50/50 hover:scale-105 active:scale-95 min-w-[120px]"
                >
                  <span className="text-3xl">❓</span>
                  <span className="text-sm font-black text-stone-900">{names[idx]}</span>
                  <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-[11px] font-bold">
                    চোর ঘোষণা করুন!
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              <span className="text-xs font-bold text-stone-600">
                পুলিশ ভাবছে... সন্দেহভাজনদের মুখের ভাব পর্যবেক্ষণ করছে!
              </span>
            </div>
          )}
        </div>
      )}

      {/* PHASE 4: রাউন্ডের ফলাফল ও পয়েন্ট যোগ */}
      {phase === 'result' && (
        <div className="rounded-3xl border border-stone-300 bg-[#fffdf8] p-6 text-center shadow-md space-y-4">
          {/* Result banner */}
          <div
            className={`rounded-2xl p-4 shadow-sm ${
              roles[accusedIndex] === 'chor'
                ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-950'
                : 'border-2 border-red-400 bg-red-50 text-red-950'
            }`}
          >
            <div className="text-xl font-black">
              {roles[accusedIndex] === 'chor'
                ? '🎉 সাবাশ! চোর ধরা পড়েছে!'
                : '😱 হায়! ভুল অনুমান! চোর পালিয়ে গেল!'}
            </div>
            <div className="text-xs mt-1 font-medium">
              {roles[accusedIndex] === 'chor'
                ? `${names[policeIndex]} (পুলিশ) সফলভাবে ${names[accusedIndex]}-কে চোর হিসেবে চিহ্নিত করেছেন। পুলিশ পেল ৫০০ পয়েন্ট!`
                : `${names[accusedIndex]} চোর ছিলেন না (তিনি ছিলেন ${ROLES_INFO[roles[accusedIndex]].name})! ফলে চোর (${names[chorIndex]}) পুলিশের ৫০০ পয়েন্ট ছিনিয়ে নিয়েছে!`}
            </div>
          </div>

          {/* 4 Player Chit Cards Reveal */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {names.map((n, i) => {
              const r = roles[i];
              return (
                <div
                  key={i}
                  className={`rounded-2xl border p-3 text-center shadow-xs ${
                    r === 'chor'
                      ? 'border-red-300 bg-red-50/60'
                      : r === 'police'
                      ? 'border-blue-300 bg-blue-50/60'
                      : 'border-amber-200 bg-amber-50/60'
                  }`}
                >
                  <div className="text-2xl">{ROLES_INFO[r].emoji}</div>
                  <div className="text-xs font-bold text-stone-800 truncate">{n}</div>
                  <div className="text-xs font-black text-stone-700">{ROLES_INFO[r].name}</div>
                  <div className="mt-1 font-mono text-sm font-black text-emerald-700">
                    +{roundGains[i]} পয়েন্ট
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next / Finish Buttons */}
          <div className="pt-2">
            {round < totalRounds ? (
              <button
                onClick={handleNextRound}
                className="rounded-2xl bg-emerald-700 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800 active:scale-95"
              >
                পরের রাউন্ড ({round + 1}/{totalRounds}) ➜
              </button>
            ) : (
              <div className="space-y-3">
                <div className="text-lg font-black text-stone-900">
                  🏆 সর্বোচ্চ পয়েন্টে বিজয়ী:{' '}
                  <span className="text-emerald-800">{names[winnerIndex]}</span> ({highestScore} পয়েন্ট)
                </div>
                <button
                  onClick={handleFinish}
                  className="rounded-2xl bg-emerald-700 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800 active:scale-95"
                >
                  🏁 খেলা শেষ করুন
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
