'use client';

import React, {useEffect, useRef, useState} from 'react';
import {Lang, t} from '@/lib/i18n';
import type {GameProps, Outcome} from '@/lib/types';
import {newMatch, applyBall, Match} from '@/lib/games/paper-cricket/engine';
import {getComputerCricketAction, computerRollDelivery} from '@/lib/games/paper-cricket/computer';
import {playPenSpin, playCricketBoundary, playWicket, playDotBall, playPenClick} from '@/lib/audio';

// 12-hour clock dial sectors
export interface ClockSector {
  hour: number;
  angle: number; // degrees, 0 = 12 o'clock / Top
  outcome: Outcome;
  label: string;
}

export const CLOCK_SECTORS: ClockSector[] = [
  {hour: 12, angle: 0, outcome: 6, label: '6'},
  {hour: 1, angle: 30, outcome: 1, label: '1'},
  {hour: 2, angle: 60, outcome: 2, label: '2'},
  {hour: 3, angle: 90, outcome: 4, label: '4'},
  {hour: 4, angle: 120, outcome: 0, label: '0'},
  {hour: 5, angle: 150, outcome: 1, label: '1'},
  {hour: 6, angle: 180, outcome: 'W', label: 'OUT'},
  {hour: 7, angle: 210, outcome: 3, label: '3'},
  {hour: 8, angle: 240, outcome: 2, label: '2'},
  {hour: 9, angle: 270, outcome: 4, label: '4'},
  {hour: 10, angle: 300, outcome: 0, label: '0'},
  {hour: 11, angle: 330, outcome: 1, label: '1'},
];

export default function Cricket({lang, mode, difficulty, houseRules, onExit, onDone}: GameProps) {
  const T = (k: string) => t(lang, k);

  const maxBalls = houseRules?.cricketBalls ?? 12;
  const maxWickets = houseRules?.cricketWickets ?? 2;

  const [match, setMatch] = useState<Match>(() => newMatch(maxBalls, maxWickets));
  const [spinning, setSpinning] = useState(false);
  const [penRotation, setPenRotation] = useState(0);
  const [activeSectorIndex, setActiveSectorIndex] = useState<number | null>(null);
  const [lastOutcome, setLastOutcome] = useState<Outcome | null>(null);
  const [commentary, setCommentary] = useState<string>('');

  const saved = useRef(false);
  const currentRotationRef = useRef(0);

  const p1Name = mode === 'solo' ? T('you') : mode === 'computer' ? T('you') : T('p1');
  const p2Name = mode === 'solo' ? T('solo') : mode === 'computer' ? T('cpu') : T('p2');
  const names = [p1Name, p2Name];

  const currentBatsman = match.batting;
  const isCpuTurn = mode === 'computer' && currentBatsman === 1 && !match.done;
  const isMyTurn = !match.done && !spinning && !isCpuTurn;

  const handleSpin = () => {
    if (spinning || match.done) return;

    setSpinning(true);
    setActiveSectorIndex(null);
    setCommentary(lang === 'bn' ? 'ঘুরছে...' : 'Spinning...');

    playPenSpin(1100);

    const outcome = computerRollDelivery();

    const candidates = CLOCK_SECTORS.map((s, idx) => ({...s, idx})).filter(s => s.outcome === outcome);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? {idx: 0, angle: 0};

    const extraSpins = 360 * (5 + Math.floor(Math.random() * 2));
    const currentAngleMod = ((currentRotationRef.current % 360) + 360) % 360;
    const delta = (chosen.angle - currentAngleMod + 360) % 360;
    const finalAngle = currentRotationRef.current + extraSpins + delta;

    currentRotationRef.current = finalAngle;
    setPenRotation(finalAngle);

    setTimeout(() => {
      setSpinning(false);
      setActiveSectorIndex(chosen.idx);
      setLastOutcome(outcome);
      setMatch(prev => applyBall(prev, outcome));

      if (outcome === 6) {
        playCricketBoundary(6);
        setCommentary(lang === 'bn' ? 'বিশাল ছক্কা! (৬ রান)' : 'SIX! Over the boundary!');
      } else if (outcome === 4) {
        playCricketBoundary(4);
        setCommentary(lang === 'bn' ? 'চার রান! (৪ রান)' : 'FOUR! Beautiful boundary!');
      } else if (outcome === 'W') {
        playWicket();
        setCommentary(lang === 'bn' ? 'আউট! উইকেট পতন!' : 'OUT! Wicket falls!');
      } else if (outcome === 0) {
        playDotBall();
        setCommentary(lang === 'bn' ? 'ডট বল' : 'Dot ball');
      } else {
        playPenClick();
        setCommentary(lang === 'bn' ? `${outcome} রান` : `${outcome} Run${outcome > 1 ? 's' : ''}`);
      }
    }, 1200);
  };

  useEffect(() => {
    if (isCpuTurn && !spinning && !match.done) {
      const action = getComputerCricketAction(difficulty);
      const timer = setTimeout(() => {
        handleSpin();
      }, action.thinkingDelayMs);
      return () => clearTimeout(timer);
    }
  }, [isCpuTurn, spinning, match.done, difficulty]);

  useEffect(() => {
    if (match.done && !saved.current) {
      saved.current = true;
      if (mode !== 'solo') {
        const resultText = `${match.runs[0]}/${match.wickets[0]} vs ${match.runs[1]}/${match.wickets[1]}`;
        onDone({
          id: Date.now().toString(),
          game: 'cricket',
          mode,
          date: new Date().toISOString(),
          result: resultText,
          details: match.winner === 'tie' ? T('tie') : `${names[match.winner as number]} ${T('wins')}`,
        });
      }
    }
  }, [match.done]);

  const restartMatch = () => {
    saved.current = false;
    setMatch(newMatch(maxBalls, maxWickets));
    setActiveSectorIndex(null);
    setLastOutcome(null);
    setCommentary('');
  };

  const formatOvers = (balls: number) => {
    const ov = Math.floor(balls / 6);
    const b = balls % 6;
    return `${ov}.${b}`;
  };

  const winText =
    match.winner === 'tie'
      ? T('tie')
      : match.winner !== null
      ? `${names[match.winner]} ${T('wins')}`
      : '';

  const targetRuns = match.runs[0] + 1;
  const runsRemaining = targetRuns - match.runs[1];
  const ballsRemaining = match.maxBalls - match.balls[1];

  return (
    <div className="mx-auto max-w-md space-y-3.5">
      {/* Clean Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
        <button
          onClick={onExit}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 active:scale-95"
        >
          ← {T('back')}
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold text-stone-900">{T('cricket')}</h2>
          <span className="text-[11px] text-stone-500 font-medium">
            {mode === 'computer'
              ? `${T('computer')} (${T(difficulty)})`
              : mode === 'solo'
              ? T('solo')
              : T('local')}
          </span>
        </div>

        <button
          onClick={restartMatch}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 active:scale-95"
        >
          {T('rematch')}
        </button>
      </div>

      {/* Turn Banner */}
      {!match.done && (
        <div
          className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-xs transition ${
            isMyTurn
              ? 'bg-emerald-700 text-white font-semibold'
              : 'bg-stone-100 text-stone-600 font-medium'
          }`}
        >
          <span>
            {isMyTurn
              ? lang === 'bn'
                ? 'আপনার পালা: কলম ঘোরান'
                : 'Your turn: Spin the pen'
              : lang === 'bn'
              ? 'কম্পিউটার ভাবছে...'
              : 'Computer is playing...'}
          </span>
          <span className="text-[11px] opacity-90">
            {names[currentBatsman]} {lang === 'bn' ? 'ব্যাটিং' : 'Batting'}
          </span>
        </div>
      )}

      {/* Clean Scorecard */}
      <div className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-2.5 shadow-xs">
        <div className="grid grid-cols-2 gap-2.5">
          {[0, 1].map(idx => {
            const isBatting = match.batting === idx && !match.done;
            const isYou = idx === 0;

            return (
              <div
                key={idx}
                className={`rounded-lg p-2.5 transition border ${
                  isBatting
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-stone-100 bg-stone-50/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900 flex items-center gap-1">
                    <span>{names[idx]}</span>
                    {isYou && <span className="text-[10px] text-stone-500">({T('you')})</span>}
                  </span>
                  {isBatting && (
                    <span className="rounded bg-emerald-700 text-white px-1.5 py-0.2 text-[9px] font-bold">
                      {lang === 'bn' ? 'ব্যাট' : 'BAT'}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-stone-900">{match.runs[idx]}</span>
                  <span className="text-sm text-stone-500 font-medium">/{match.wickets[idx]}</span>
                  <span className="ml-auto text-xs text-stone-500">
                    {formatOvers(match.balls[idx])} ov
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Target summary */}
        <div className="text-center text-xs text-stone-600 font-medium pt-1 border-t border-stone-100">
          {match.innings === 2 && !match.done ? (
            <span>
              {T('target')}: <b>{targetRuns}</b> • {T('needs')}{' '}
              <b>{Math.max(0, runsRemaining)}</b> {T('from')}{' '}
              <b>{Math.max(0, ballsRemaining)}</b> {T('balls')}
            </span>
          ) : match.done ? (
            <span className="font-bold text-emerald-800">{winText}</span>
          ) : (
            <span>
              {T('firstInnings')}: {maxBalls} {T('balls')} • {maxWickets} {T('wk')}
            </span>
          )}
        </div>
      </div>

      {/* CLOCK DIAL & PEN (Clean vector styling) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="mx-auto flex items-center justify-center">
          <svg
            viewBox="0 0 340 340"
            className="w-full max-w-[290px] aspect-square select-none"
          >
            <defs>
              <linearGradient id="cleanBarrel" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="30%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="cleanInk" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>

            {/* Dial circle */}
            <circle cx="170" cy="170" r="148" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="2" />
            <circle cx="170" cy="170" r="105" fill="none" stroke="#f0efed" strokeWidth="1" strokeDasharray="2,2" />

            {/* Clock sectors */}
            {CLOCK_SECTORS.map((sector, index) => {
              const rad = ((sector.angle - 90) * Math.PI) / 180;
              const radius = 124;
              const cx = 170 + radius * Math.cos(rad);
              const cy = 170 + radius * Math.sin(rad);

              const isSelected = activeSectorIndex === index;
              const isBoundary = sector.outcome === 6 || sector.outcome === 4;
              const isOut = sector.outcome === 'W';

              let fill = '#ffffff';
              let stroke = '#d6d3d1';
              let text = '#1c1917';

              if (isSelected) {
                fill = '#047857';
                stroke = '#047857';
                text = '#ffffff';
              } else if (isBoundary) {
                fill = '#f4f4f5';
                stroke = '#71717a';
                text = '#09090b';
              } else if (isOut) {
                fill = '#fef2f2';
                stroke = '#fca5a5';
                text = '#b91c1c';
              }

              return (
                <g key={index}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 18 : 15}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSelected ? 2.5 : 1}
                    className="transition-all"
                  />
                  <text
                    x={cx}
                    y={cy + (sector.label === 'OUT' ? 3.5 : 4.5)}
                    textAnchor="middle"
                    fontSize={sector.label === 'OUT' ? 9 : 12}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    fill={text}
                  >
                    {sector.label}
                  </text>
                  <text
                    x={cx + 10}
                    y={cy - 10}
                    textAnchor="middle"
                    fontSize="6.5"
                    fontFamily="monospace"
                    fill="#a8a29e"
                  >
                    {sector.hour}
                  </text>
                </g>
              );
            })}

            {/* Center pivot */}
            <circle cx="170" cy="170" r="14" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="1.5" />

            {/* Rotating Pen */}
            <g
              transform={`translate(170, 170) rotate(${penRotation})`}
              style={{
                transition: spinning
                  ? 'transform 1.2s cubic-bezier(0.15, 0.85, 0.35, 1.0)'
                  : 'transform 0.15s ease-out',
                cursor: isMyTurn ? 'pointer' : 'default',
              }}
              onClick={isMyTurn ? handleSpin : undefined}
            >
              {/* Subtle shadow */}
              <rect
                x="-4"
                y="-120"
                width="10"
                height="190"
                rx="5"
                fill="#000000"
                opacity="0.12"
                transform="translate(4, 4)"
              />

              {/* Nib tip */}
              <circle cx="0" cy="-124" r="1.8" fill="#1c1917" />
              {/* Cone */}
              <polygon points="-3.5,-108 3.5,-108 1.5,-123 -1.5,-123" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
              {/* Barrel */}
              <rect
                x="-5.5"
                y="-105"
                width="11"
                height="150"
                rx="2"
                fill="url(#cleanBarrel)"
                stroke="#94a3b8"
                strokeWidth="0.5"
              />
              {/* Inner blue ink tube */}
              <rect x="-1.5" y="-98" width="3" height="120" rx="0.5" fill="url(#cleanInk)" />
              {/* Back stopper */}
              <polygon points="-5,45 5,45 4,55 -4,55" fill="#1e3a8a" />
              {/* Clip */}
              <path d="M 4,22 L 9,22 C 10,22 10,25 9,25 L 7,45 L 5,45 Z" fill="#1e3a8a" />
            </g>

            <circle cx="170" cy="170" r="4" fill="#0f172a" />
          </svg>
        </div>

        {/* Dynamic commentary */}
        <div className="mt-2 text-center min-h-[32px] flex items-center justify-center">
          {commentary ? (
            <span className="text-xs font-bold text-stone-800">{commentary}</span>
          ) : (
            <span className="text-[11px] text-stone-400">
              {isMyTurn
                ? lang === 'bn'
                  ? 'কলমে চাপ দিয়ে ঘোরান'
                  : 'Tap the pen to spin'
                : T('computerThinking')}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-3 flex justify-center">
          {!match.done ? (
            <button
              onClick={handleSpin}
              disabled={spinning || isCpuTurn}
              className={`w-full max-w-xs rounded-xl py-2.5 text-xs font-bold transition active:scale-95 disabled:opacity-40 ${
                isMyTurn
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
            >
              {spinning
                ? T('spinning')
                : isCpuTurn
                ? `${T('cpu')} ${T('spinning')}`
                : `${T('spin')} (${names[currentBatsman]})`}
            </button>
          ) : (
            <button
              onClick={restartMatch}
              className="w-full max-w-xs rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800 active:scale-95"
            >
              {T('rematch')}
            </button>
          )}
        </div>
      </div>

      {/* Deliveries log */}
      <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
          <span>{lang === 'bn' ? 'বলের হিসেব' : 'Ball Log'}</span>
          <span>{match.log.length} {T('balls')}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {match.log.length === 0 ? (
            <span className="text-xs text-stone-400 py-1">
              {lang === 'bn' ? 'এখনও কোনো বল করা হয়নি' : 'No balls bowled yet'}
            </span>
          ) : (
            match.log.map((outcome, idx) => (
              <span
                key={idx}
                className={`flex h-6 w-6 items-center justify-center rounded text-xs font-mono font-semibold border ${
                  outcome === 6
                    ? 'bg-stone-900 text-white border-stone-900'
                    : outcome === 4
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : outcome === 'W'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {outcome === 'W' ? 'W' : outcome}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
