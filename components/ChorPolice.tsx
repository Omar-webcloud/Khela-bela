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
    desc: 'সর্বোচ্চ শাসক। ১০০০ পয়েন্ট নিশ্চিত।',
  },
  mantri: {
    id: 'mantri',
    name: 'মন্ত্রী',
    points: 800,
    emoji: '📜',
    desc: 'রাজার বিশ্বস্ত উপদেষ্টা। ৮০০ পয়েন্ট।',
  },
  police: {
    id: 'police',
    name: 'পুলিশ',
    points: 500,
    emoji: '👮',
    desc: 'চোর শনাক্ত করতে হবে। সফল হলে ৫০০ পয়েন্ট।',
  },
  chor: {
    id: 'chor',
    name: 'চোর',
    points: 0,
    emoji: '🎭',
    desc: 'পুলিশ ভুল করলে ৫০০ পয়েন্ট চোরের।',
  },
};

export default function ChorPolice({mode, difficulty, houseRules, onExit, onDone}: GameProps) {
  const totalRounds = houseRules?.chorRounds ?? 5;

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

  const handleToggleChit = () => {
    playPaperRustle();
    setChitUnfolded(!chitUnfolded);
  };

  const handleConfirmChit = () => {
    playPaperRustle();
    setChitUnfolded(false);
    if (passIndex + 1 < humanPlayers.length) {
      setPassIndex(passIndex + 1);
    } else {
      setPhase('court');
    }
  };

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

  useEffect(() => {
    if (phase === 'guess' && !isHumanPolice) {
      setThinking(true);
      const timer = setTimeout(() => {
        setThinking(false);
        const guess = computerGuess(policeIndex, difficulty, chorHistory);
        handleAccusation(guess);
      }, 1200);
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
        details: `${totalRounds} রাউন্ড সম্পন্ন`,
      });
    }
    onExit();
  };

  return (
    <div className="mx-auto max-w-md space-y-3.5">
      {/* Clean Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
        <button
          onClick={onExit}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 active:scale-95"
        >
          ← তালিকায় ফিরুন
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold text-stone-900">রাজা-মন্ত্রী-চোর-পুলিশ</h2>
          <span className="text-[11px] text-stone-500 font-medium">
            রাউন্ড {round}/{totalRounds}
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
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 active:scale-95"
        >
          নতুন খেলা
        </button>
      </div>

      {/* Progress tracker */}
      <div className="flex items-center justify-between rounded-lg bg-stone-100 px-3 py-1.5 text-[11px] text-stone-500 font-medium">
        <span className={phase === 'reveal' ? 'font-bold text-stone-900' : ''}>১. চিরকুট</span>
        <span>›</span>
        <span className={phase === 'court' ? 'font-bold text-stone-900' : ''}>২. দরবার</span>
        <span>›</span>
        <span className={phase === 'guess' ? 'font-bold text-stone-900' : ''}>৩. অনুমান</span>
        <span>›</span>
        <span className={phase === 'result' ? 'font-bold text-stone-900' : ''}>৪. ফলাফল</span>
      </div>

      {/* Clean Scoreboard */}
      <div className="grid grid-cols-4 gap-2">
        {names.map((n, i) => {
          const isYou = i === 0;

          return (
            <div
              key={i}
              className={`rounded-xl border p-2 text-center transition ${
                isYou
                  ? 'border-emerald-600 bg-emerald-50/50'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="truncate text-xs font-semibold text-stone-700 flex items-center justify-center gap-1">
                <span>{n}</span>
                {isYou && <span className="text-[9px] text-emerald-800 font-bold">★</span>}
              </div>
              <div className="text-xl font-bold text-stone-900 mt-0.5">{totalScores[i]}</div>
              <div className="text-[10px] text-stone-400">পয়েন্ট</div>
            </div>
          );
        })}
      </div>

      {/* PHASE 1: চিরকুট দেখা */}
      {phase === 'reveal' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center space-y-4 shadow-xs">
          <div>
            <div className="text-xs font-medium text-stone-500">গোপনে নিজের ভূমিকা দেখুন</div>
            <h3 className="text-sm font-bold text-stone-900 mt-0.5">
              খেলোয়াড়: {names[humanPlayers[passIndex]]}
            </h3>
          </div>

          <div className="flex justify-center py-2">
            <div
              onClick={handleToggleChit}
              className={`h-40 w-56 cursor-pointer rounded-xl border p-4 transition-all flex flex-col items-center justify-center select-none ${
                chitUnfolded
                  ? 'border-emerald-600 bg-emerald-50/30'
                  : 'border-stone-300 bg-stone-50 hover:bg-stone-100'
              }`}
            >
              {!chitUnfolded ? (
                <div className="space-y-1.5">
                  <span className="text-2xl">✉️</span>
                  <div className="text-xs font-semibold text-stone-700">ভাঁজ করা চিরকুট</div>
                  <span className="inline-block rounded-md bg-stone-900 px-3 py-1 text-[11px] font-semibold text-white">
                    খুলুন
                  </span>
                </div>
              ) : (
                <div className="space-y-1 animate-fade-in">
                  <span className="text-3xl">{ROLES_INFO[roles[humanPlayers[passIndex]]].emoji}</span>
                  <div className="text-lg font-bold text-stone-900">
                    {ROLES_INFO[roles[humanPlayers[passIndex]]].name}
                  </div>
                  <div className="text-xs font-bold text-emerald-700">
                    {ROLES_INFO[roles[humanPlayers[passIndex]]].points} পয়েন্ট
                  </div>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    {ROLES_INFO[roles[humanPlayers[passIndex]]].desc}
                  </p>
                </div>
              )}
            </div>
          </div>

          {chitUnfolded && (
            <button
              onClick={handleConfirmChit}
              className="w-full max-w-xs rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800 active:scale-95"
            >
              লুকিয়ে এগিয়ে যান
            </button>
          )}
        </div>
      )}

      {/* PHASE 2: দরবার সংলাপ */}
      {phase === 'court' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center space-y-3.5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
            রাজদরবারের ঘোষণা
          </div>

          <div className="space-y-2 text-left">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 flex items-start gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <div className="text-[11px] font-semibold text-stone-500">{names[rajaIndex]} (রাজা)</div>
                <div className="text-xs font-bold text-stone-900">"আমার মন্ত্রী কে?"</div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 flex items-start gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <div className="text-[11px] font-semibold text-stone-500">{names[mantriIndex]} (মন্ত্রী)</div>
                <div className="text-xs font-bold text-stone-900">"আমি আপনার মন্ত্রী, জাঁহাপনা!"</div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 flex items-start gap-3">
              <span className="text-2xl">👮</span>
              <div>
                <div className="text-[11px] font-semibold text-stone-500">রাজার নির্দেশ</div>
                <div className="text-xs font-bold text-stone-900">
                  "পুলিশ! বাকিদের ভেতর থেকে চোরকে শনাক্ত করো!"
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playPenClick();
              setPhase('guess');
            }}
            className="w-full max-w-xs rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800 active:scale-95"
          >
            চোর শনাক্ত করুন →
          </button>
        </div>
      )}

      {/* PHASE 3: চোর অনুমান */}
      {phase === 'guess' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center space-y-4 shadow-xs">
          <div>
            <div className="text-xs font-medium text-stone-500">পুলিশের দায়িত্ব</div>
            <h3 className="text-sm font-bold text-stone-900 mt-0.5">
              {names[policeIndex]} {isHumanPolice ? '(আপনি)' : ''}
            </h3>
          </div>

          <p className="text-xs text-stone-600">
            {isHumanPolice
              ? 'সন্দেহভাজনদের মধ্যে কাকে চোর মনে হচ্ছে? নির্বাচন করুন:'
              : 'পুলিশ চোর শনাক্ত করছে...'}
          </p>

          {isHumanPolice ? (
            <div className="flex flex-wrap justify-center gap-2.5">
              {candidates(roles).map(idx => (
                <button
                  key={idx}
                  onClick={() => handleAccusation(idx)}
                  className="flex flex-col items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 p-3 text-center transition hover:border-stone-400 hover:bg-white active:scale-95 min-w-[100px]"
                >
                  <span className="text-xl">❓</span>
                  <span className="text-xs font-bold text-stone-900">{names[idx]}</span>
                  <span className="text-[10px] text-stone-500">সন্দেহভাজন</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-4 text-xs text-stone-500">
              কম্পিউটার পুলিশ সিদ্ধান্ত নিচ্ছে...
            </div>
          )}
        </div>
      )}

      {/* PHASE 4: ফলাফল */}
      {phase === 'result' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center space-y-3.5 shadow-xs">
          <div
            className={`rounded-xl p-3 text-xs font-semibold ${
              roles[accusedIndex] === 'chor'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-stone-100 text-stone-800 border border-stone-200'
            }`}
          >
            {roles[accusedIndex] === 'chor'
              ? `চোর ধরা পড়েছে! ${names[policeIndex]} পেল ৫০০ পয়েন্ট।`
              : `ভুল অনুমান! চোর (${names[chorIndex]}) পুলিশের ৫০০ পয়েন্ট নিল।`}
          </div>

          {/* Cards reveal */}
          <div className="grid grid-cols-4 gap-2">
            {names.map((n, i) => {
              const r = roles[i];
              const isYou = i === 0;

              return (
                <div
                  key={i}
                  className={`rounded-xl border p-2.5 text-center ${
                    isYou
                      ? 'border-emerald-600 bg-emerald-50/40'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="text-xl">{ROLES_INFO[r].emoji}</div>
                  <div className="text-[11px] font-semibold text-stone-700 truncate">{n}</div>
                  <div className="text-xs font-bold text-stone-900">{ROLES_INFO[r].name}</div>
                  <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                    +{roundGains[i]}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-1">
            {round < totalRounds ? (
              <button
                onClick={handleNextRound}
                className="w-full max-w-xs rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800 active:scale-95"
              >
                পরের রাউন্ড ({round + 1}/{totalRounds}) →
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-bold text-stone-900">
                  বিজয়ী: {names[winnerIndex]} ({highestScore} পয়েন্ট)
                </div>
                <button
                  onClick={handleFinish}
                  className="w-full max-w-xs rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800 active:scale-95"
                >
                  খেলা সমাপ্ত
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
