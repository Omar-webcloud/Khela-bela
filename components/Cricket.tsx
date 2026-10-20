'use client';

import React, {useEffect, useRef, useState} from 'react';
import {Lang, t} from '@/lib/i18n';
import type {GameProps, Outcome} from '@/lib/types';
import {newMatch, applyBall, Match} from '@/lib/games/paper-cricket/engine';
import {getComputerCricketAction, computerRollDelivery} from '@/lib/games/paper-cricket/computer';
import {playPenSpin, playCricketBoundary, playWicket, playDotBall, playPenClick} from '@/lib/audio';

// 12-hour clock dial sectors (mathematically exact angles: 0° = 12 o'clock / Top)
export interface ClockSector {
  hour: number;
  angle: number; // degrees, 0 = 12 o'clock, 90 = 3 o'clock, 180 = 6 o'clock, 270 = 9 o'clock
  outcome: Outcome;
  label: string;
  badgeType: 'six' | 'four' | 'wicket' | 'runs' | 'dot';
}

export const CLOCK_SECTORS: ClockSector[] = [
  {hour: 12, angle: 0, outcome: 6, label: '6', badgeType: 'six'},
  {hour: 1, angle: 30, outcome: 1, label: '1', badgeType: 'runs'},
  {hour: 2, angle: 60, outcome: 2, label: '2', badgeType: 'runs'},
  {hour: 3, angle: 90, outcome: 4, label: '4', badgeType: 'four'},
  {hour: 4, angle: 120, outcome: 0, label: '0', badgeType: 'dot'},
  {hour: 5, angle: 150, outcome: 1, label: '1', badgeType: 'runs'},
  {hour: 6, angle: 180, outcome: 'W', label: 'OUT', badgeType: 'wicket'},
  {hour: 7, angle: 210, outcome: 3, label: '3', badgeType: 'runs'},
  {hour: 8, angle: 240, outcome: 2, label: '2', badgeType: 'runs'},
  {hour: 9, angle: 270, outcome: 4, label: '4', badgeType: 'four'},
  {hour: 10, angle: 300, outcome: 0, label: '0', badgeType: 'dot'},
  {hour: 11, angle: 330, outcome: 1, label: '1', badgeType: 'runs'},
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

  // Spin the ballpoint pen
  const handleSpin = () => {
    if (spinning || match.done) return;

    setSpinning(true);
    setActiveSectorIndex(null);
    setCommentary(lang === 'bn' ? '🌀 কলম ঘুরছে...' : '🌀 Spinning the pen...');

    playPenSpin(1200);

    // Roll result from pure engine rules
    const outcome = computerRollDelivery();

    // Select candidate sector matching outcome
    const candidates = CLOCK_SECTORS.map((s, idx) => ({...s, idx})).filter(s => s.outcome === outcome);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? {idx: 0, angle: 0};

    // Calculate rotation: 5-7 complete spins + exact sector angle
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 2));
    const currentAngleMod = ((currentRotationRef.current % 360) + 360) % 360;
    const delta = ((chosen.angle - currentAngleMod + 360) % 360);
    const finalAngle = currentRotationRef.current + extraSpins + delta;

    currentRotationRef.current = finalAngle;
    setPenRotation(finalAngle);

    // After deceleration
    setTimeout(() => {
      setSpinning(false);
      setActiveSectorIndex(chosen.idx);
      setLastOutcome(outcome);
      setMatch(prev => applyBall(prev, outcome));

      // Humanized, energetic cricket commentary
      if (outcome === 6) {
        playCricketBoundary(6);
        setCommentary(
          lang === 'bn'
            ? '🚀 বিশাল ছক্কা!! বল খাতার সীমানা ছাড়িয়ে বাইরে!'
            : '🚀 MASSIVE SIX!! Smoked clean out of the stadium!'
        );
      } else if (outcome === 4) {
        playCricketBoundary(4);
        setCommentary(
          lang === 'bn'
            ? '⚡ চমৎকার চার!! চোখ জুড়ানো বাউন্ডারি!'
            : '⚡ CRACKING FOUR!! Sliced sweetly to the rope!'
        );
      } else if (outcome === 'W') {
        playWicket();
        setCommentary(
          lang === 'bn'
            ? '💥 বোল্ড আউট!! উইকেট ভেঙে চুরমার!'
            : '💥 TIMBER!! Stumps shattered! Batsman walks back!'
        );
      } else if (outcome === 0) {
        playDotBall();
        setCommentary(
          lang === 'bn'
            ? '🛡️ ডট বল! সতর্কভাবে বল আটকে দিলেন।'
            : '🛡️ Dot ball! Sound defensive push.'
        );
      } else {
        playPenClick();
        setCommentary(
          lang === 'bn'
            ? `🏃 ${outcome} রান! দ্রুত দৌড়ে প্রান্ত বদল।`
            : `🏃 ${outcome} Run${outcome > 1 ? 's' : ''}! Good calling between the wickets.`
        );
      }
    }, 1300);
  };

  // AI CPU Opponent automation
  useEffect(() => {
    if (isCpuTurn && !spinning && !match.done) {
      const action = getComputerCricketAction(difficulty);
      const timer = setTimeout(() => {
        handleSpin();
      }, action.thinkingDelayMs);
      return () => clearTimeout(timer);
    }
  }, [isCpuTurn, spinning, match.done, difficulty]);

  // Match completion handling
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
      ? `🤝 ${T('tie')}`
      : match.winner !== null
      ? `🏆 ${names[match.winner]} ${T('wins')}`
      : '';

  const targetRuns = match.runs[0] + 1;
  const runsRemaining = targetRuns - match.runs[1];
  const ballsRemaining = match.maxBalls - match.balls[1];

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-95"
        >
          <span>←</span>
          <span>{T('back')}</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg font-black tracking-tight text-emerald-950 sm:text-xl">
            {T('cricket')}
          </h2>
          <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
            {mode === 'computer'
              ? `${T('computer')} (${T(difficulty)})`
              : mode === 'solo'
              ? T('solo')
              : T('local')}
          </span>
        </div>

        <button
          onClick={restartMatch}
          className="flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-95"
          title={T('rematch')}
        >
          🔄 {T('rematch')}
        </button>
      </div>

      {/* Ruled Notebook Scorecard */}
      <div className="relative overflow-hidden rounded-2xl border border-stone-300 bg-[#fffdfa] p-4 shadow-sm">
        {/* Notebook red margin line */}
        <div className="pointer-events-none absolute bottom-0 left-6 top-0 w-[2px] bg-red-400/60" />

        <div className="pl-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map(idx => {
              const isBatting = match.batting === idx && !match.done;
              return (
                <div
                  key={idx}
                  className={`relative rounded-xl border p-3 transition-all ${
                    isBatting
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/30'
                      : 'border-stone-200 bg-white/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900 flex items-center gap-1">
                      <span>{names[idx]}</span>
                      {isBatting && <span className="text-emerald-700">🏏</span>}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      {idx === 0 ? T('firstInnings') : T('secondInnings')}
                    </span>
                  </div>

                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-stone-900">{match.runs[idx]}</span>
                    <span className="text-lg font-bold text-stone-500">/{match.wickets[idx]}</span>
                    <span className="ml-auto text-xs font-semibold text-stone-500">
                      ({formatOvers(match.balls[idx])} ov)
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] text-stone-600 font-medium">
                    {match.balls[idx]}/{match.maxBalls} {T('balls')} • {match.wickets[idx]}/{match.maxWickets} {T('wk')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Innings Status Banner */}
          <div className="rounded-xl bg-amber-50/90 border border-amber-200/80 px-3.5 py-2 text-xs font-semibold text-amber-950">
            {match.innings === 2 && !match.done ? (
              <span>
                🎯 {T('target')}: <b>{targetRuns}</b> — {names[1]} {T('needs')}{' '}
                <b>{Math.max(0, runsRemaining)}</b> {T('from')}{' '}
                <b>{Math.max(0, ballsRemaining)}</b> {T('balls')} {T('toWin')}
              </span>
            ) : match.done ? (
              <span className="font-bold text-emerald-800 text-sm">{winText}</span>
            ) : (
              <span>
                🏏 {T('firstInnings')}: {names[0]} {T('batting')} • {maxBalls} {T('balls')},{' '}
                {maxWickets} {T('wk')} max
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CLOCK DIAL & REALISTIC BALLPOINT PEN (100% SVG Vector Field) */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-300 bg-[#fffdf8] p-4 shadow-md sm:p-6">
        {/* Ruled blue paper background texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, #1d4ed8, #1d4ed8 1px, transparent 1px, transparent 24px)',
          }}
        />

        {/* Dial Title */}
        <div className="relative z-10 mb-2 flex items-center justify-between text-xs font-bold text-stone-500">
          <span className="uppercase tracking-wider">
            {lang === 'bn' ? 'খাতার পাতার ১২ ঘণ্টার ক্রিকেট ডায়াল' : '12-Hour Pen Cricket Dial'}
          </span>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-emerald-800">
            {lang === 'bn' ? '১২ টায় ৬ • ৩ ও ৯ এ ৪' : '6 at 12 • 4 at 3 & 9'}
          </span>
        </div>

        {/* ALL-SVG PRECISION CLOCK & PEN CONTAINER */}
        <div className="relative mx-auto flex items-center justify-center">
          <svg
            viewBox="0 0 360 360"
            className="w-full max-w-[340px] aspect-square select-none filter drop-shadow-sm"
          >
            <defs>
              {/* Barrel Transparent Gradient */}
              <linearGradient id="barrelGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.8" />
                <stop offset="20%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#e5e7eb" stopOpacity="0.75" />
                <stop offset="80%" stopColor="#9ca3af" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6b7280" stopOpacity="0.9" />
              </linearGradient>

              {/* Ink Tube Gradient */}
              <linearGradient id="blueInk" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>

              {/* Brass/Steel Cone Tip */}
              <linearGradient id="metalTip" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e5e7eb" />
                <stop offset="40%" stopColor="#ffffff" />
                <stop offset="80%" stopColor="#9ca3af" />
                <stop offset="100%" stopColor="#4b5563" />
              </linearGradient>

              {/* Plastic Clip */}
              <linearGradient id="penBlueCap" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="40%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>

              {/* Gold 6 Gradient */}
              <radialGradient id="goldGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </radialGradient>

              {/* Emerald 4 Gradient */}
              <radialGradient id="greenGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#059669" />
              </radialGradient>

              {/* Red Wicket Gradient */}
              <radialGradient id="redGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="100%" stopColor="#dc2626" />
              </radialGradient>
            </defs>

            {/* 1. Outer Clock Dial Circles */}
            <circle cx="180" cy="180" r="162" fill="#fafaf9" stroke="#d6d3d1" strokeWidth="3" />
            <circle cx="180" cy="180" r="156" fill="none" stroke="#e7e5e4" strokeWidth="1.5" strokeDasharray="3,3" />
            <circle cx="180" cy="180" r="115" fill="none" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="2,2" />

            {/* 2. Clock Sector Ray Lines & Number Badges */}
            {CLOCK_SECTORS.map((sector, index) => {
              const rad = ((sector.angle - 90) * Math.PI) / 180;
              const radius = 132;
              const cx = 180 + radius * Math.cos(rad);
              const cy = 180 + radius * Math.sin(rad);

              const isSelected = activeSectorIndex === index;

              // Ray line from center towards sector badge
              const rayInner = 55;
              const rayOuter = 110;
              const x1 = 180 + rayInner * Math.cos(rad);
              const y1 = 180 + rayInner * Math.sin(rad);
              const x2 = 180 + rayOuter * Math.cos(rad);
              const y2 = 180 + rayOuter * Math.sin(rad);

              // Colors based on badgeType
              let badgeFill = '#ffffff';
              let badgeStroke = '#cbd5e1';
              let textColor = '#1e293b';

              if (sector.badgeType === 'six') {
                badgeFill = 'url(#goldGrad)';
                badgeStroke = '#d97706';
                textColor = '#78350f';
              } else if (sector.badgeType === 'four') {
                badgeFill = 'url(#greenGrad)';
                badgeStroke = '#047857';
                textColor = '#ffffff';
              } else if (sector.badgeType === 'wicket') {
                badgeFill = 'url(#redGrad)';
                badgeStroke = '#b91c1c';
                textColor = '#ffffff';
              } else if (sector.badgeType === 'dot') {
                badgeFill = '#f1f5f9';
                badgeStroke = '#cbd5e1';
                textColor = '#64748b';
              }

              return (
                <g key={index}>
                  {/* Sector dividing ray */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isSelected ? '#059669' : '#e2e8f0'}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={isSelected ? undefined : '2,2'}
                  />

                  {/* Highlight aura if sector is currently active */}
                  {isSelected && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="24"
                      fill="#10b981"
                      opacity="0.3"
                      className="animate-pulse"
                    />
                  )}

                  {/* Sector Badge Circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 20 : 17}
                    fill={badgeFill}
                    stroke={isSelected ? '#047857' : badgeStroke}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-300"
                  />

                  {/* Label (6, 4, 1, 2, 3, OUT, 0) */}
                  <text
                    x={cx}
                    y={cy + (sector.label === 'OUT' ? 4 : 5)}
                    textAnchor="middle"
                    fontSize={sector.label === 'OUT' ? 10 : 14}
                    fontWeight="900"
                    fontFamily="sans-serif"
                    fill={textColor}
                  >
                    {sector.label}
                  </text>

                  {/* Tiny Clock Hour Numeral (1 to 12) */}
                  <circle
                    cx={cx + 12}
                    cy={cy - 12}
                    r="6.5"
                    fill="#334155"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  <text
                    x={cx + 12}
                    y={cy - 9.5}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fontFamily="monospace"
                    fill="#ffffff"
                  >
                    {sector.hour}
                  </text>
                </g>
              );
            })}

            {/* 3. Center Pivot Rose */}
            <circle cx="180" cy="180" r="16" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="2" />
            <circle cx="180" cy="180" r="8" fill="#d6d3d1" />

            {/* 4. REALISTIC ROTATING BALLPOINT PEN */}
            {/* The group rotates around center point (180, 180) */}
            <g
              transform={`translate(180, 180) rotate(${penRotation})`}
              style={{
                transition: spinning
                  ? 'transform 1.3s cubic-bezier(0.12, 0.85, 0.32, 1.0)'
                  : 'transform 0.15s ease-out',
                cursor: !isCpuTurn && !spinning ? 'pointer' : 'default',
              }}
              onClick={!isCpuTurn && !spinning ? handleSpin : undefined}
            >
              {/* Dynamic Drop Shadow onto notebook paper */}
              <rect
                x="-5"
                y="-135"
                width="14"
                height="220"
                rx="6"
                fill="#000000"
                opacity="0.18"
                transform="translate(8, 8)"
                filter="blur(3px)"
              />

              {/* Nib Ball Bearing Point (Tip points North towards 12 o'clock) */}
              <circle cx="0" cy="-136" r="2" fill="#0f172a" />
              <circle cx="-0.5" cy="-136.5" r="0.6" fill="#ffffff" />

              {/* Brass/Nickel Metal Cone */}
              <polygon points="-4,-118 4,-118 1.8,-135 -1.8,-135" fill="url(#metalTip)" />
              <rect x="-4" y="-118" width="8" height="4" fill="#64748b" rx="0.5" />

              {/* Main Transparent Hexagonal Acrylic Barrel */}
              <rect
                x="-6.5"
                y="-114"
                width="13"
                height="170"
                rx="2"
                fill="url(#barrelGrad)"
                stroke="#94a3b8"
                strokeWidth="0.6"
              />

              {/* Hexagonal Facet Reflection Lines */}
              <line x1="-3.5" y1="-114" x2="-3.5" y2="56" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
              <line x1="3.5" y1="-114" x2="3.5" y2="56" stroke="#64748b" strokeWidth="0.8" opacity="0.6" />

              {/* Internal Blue Ink Cartridge */}
              <rect x="-2" y="-112" width="4" height="162" rx="1" fill="#e2e8f0" opacity="0.5" />
              <rect x="-1.5" y="-106" width="3" height="135" rx="0.8" fill="url(#blueInk)" />

              {/* Nostalgic Pen Brand Imprint */}
              <text
                x="0"
                y="-20"
                transform="rotate(-90 0 -20)"
                textAnchor="middle"
                fontSize="5"
                fontFamily="sans-serif"
                fontWeight="bold"
                fill="#1e3a8a"
                letterSpacing="0.8"
                opacity="0.85"
              >
                KhelaBela 0.7mm
              </text>

              {/* Pen Tail Stopper Plug */}
              <polygon points="-6,56 6,56 5,68 -5,68" fill="url(#penBlueCap)" />
              <rect x="-4" y="68" width="8" height="3" rx="1" fill="#1e3a8a" />

              {/* Pocket Clip */}
              <path
                d="M 5,28 L 11,28 C 12,28 12,32 11,32 L 8,56 L 6,56 Z"
                fill="url(#penBlueCap)"
                stroke="#1e3a8a"
                strokeWidth="0.5"
              />
              <circle cx="10" cy="30" r="1.5" fill="#93c5fd" />
            </g>

            {/* Central Pin Cap Covering Pivot */}
            <circle cx="180" cy="180" r="4.5" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
          </svg>
        </div>

        {/* Dynamic Commentary Box */}
        <div className="relative z-10 mt-3 text-center min-h-[44px] flex items-center justify-center">
          {commentary ? (
            <div className="rounded-2xl bg-stone-900 px-4 py-2 text-xs font-bold text-white shadow-md animate-fade-in sm:text-sm">
              {commentary}
            </div>
          ) : (
            <div className="text-xs text-stone-500 font-medium">
              {isCpuTurn
                ? T('computerThinking')
                : lang === 'bn'
                ? '👆 কলমটিতে চাপ দিন অথবা নিচের বোতামে ক্লিক করুন'
                : '👆 Tap the pen directly or click the button below to spin'}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="relative z-10 mt-4 flex flex-col items-center justify-center">
          {!match.done ? (
            <button
              onClick={handleSpin}
              disabled={spinning || isCpuTurn}
              className={`flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-black text-white shadow-md transition-all active:scale-95 disabled:opacity-50 sm:text-base ${
                isCpuTurn
                  ? 'bg-stone-500 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 ring-2 ring-emerald-600/40'
              }`}
            >
              <span>🖊️</span>
              <span>
                {spinning
                  ? T('spinning')
                  : isCpuTurn
                  ? `${T('cpu')} ${T('spinning')}`
                  : `${T('spin')} (${names[currentBatsman]})`}
              </span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg font-black text-emerald-800">{winText}</span>
              <button
                onClick={restartMatch}
                className="rounded-2xl bg-emerald-700 px-7 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-800 active:scale-95"
              >
                🔄 {T('rematch')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Deliveries Timeline Log */}
      <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
        <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-stone-500">
          <span>{lang === 'bn' ? 'বলের হিসেব (Timeline)' : 'Ball-by-Ball Log'}</span>
          <span>{match.log.length} {T('balls')}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {match.log.length === 0 ? (
            <span className="text-xs text-stone-400 italic">
              {lang === 'bn' ? 'এখনও কোনো বল করা হয়নি' : 'No deliveries bowled yet'}
            </span>
          ) : (
            match.log.map((outcome, idx) => {
              let color = 'bg-stone-100 text-stone-800 border-stone-200';
              if (outcome === 6) color = 'bg-amber-400 text-amber-950 font-black border-amber-500';
              else if (outcome === 4) color = 'bg-emerald-600 text-white font-bold border-emerald-700';
              else if (outcome === 'W') color = 'bg-red-600 text-white font-black border-red-700';
              else if (outcome === 0) color = 'bg-stone-200 text-stone-600 border-stone-300';

              return (
                <span
                  key={idx}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-mono shadow-sm ${color}`}
                >
                  {outcome === 'W' ? 'W' : outcome}
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
