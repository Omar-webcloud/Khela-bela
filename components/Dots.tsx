'use client';

import React, {useEffect, useRef, useState} from 'react';
import {Lang, t} from '@/lib/i18n';
import type {GameProps} from '@/lib/types';
import {newGame, play, DB} from '@/lib/games/dots-and-boxes/engine';
import {pickMove} from '@/lib/games/dots-and-boxes/computer';
import {playLineDraw, playBoxComplete, playCricketBoundary} from '@/lib/audio';

const SPACING = 68;
const PADDING = 30;

export default function Dots({lang, mode, difficulty, houseRules, onExit, onDone}: GameProps) {
  const T = (k: string) => t(lang, k);

  const gridSize = houseRules?.dotsSize ?? 3;
  const [gameState, setGameState] = useState<DB>(() => newGame(gridSize, gridSize));
  const [hoverLine, setHoverLine] = useState<number | null>(null);
  const [bonusTurnAlert, setBonusTurnAlert] = useState(false);

  const saved = useRef(false);

  const names = [
    mode === 'solo' ? T('you') : mode === 'computer' ? T('you') : T('p1'),
    mode === 'solo' ? T('solo') : mode === 'computer' ? T('cpu') : T('p2'),
  ];

  const isCpuTurn = mode === 'computer' && gameState.turn === 1 && !gameState.done;

  // Handle line click
  const handleLineClick = (lineIndex: number) => {
    if (gameState.lines[lineIndex] || gameState.done || isCpuTurn) return;

    playLineDraw();

    const previousScores = [...gameState.scores];
    const nextState = play(gameState, lineIndex);

    const scored = nextState.scores[gameState.turn] > previousScores[gameState.turn];
    if (scored) {
      playBoxComplete();
      setBonusTurnAlert(true);
      setTimeout(() => setBonusTurnAlert(false), 1200);
    }

    setGameState(nextState);
  };

  // AI Move calculation
  useEffect(() => {
    if (isCpuTurn && !gameState.done) {
      const timer = setTimeout(() => {
        const move = pickMove(gameState, difficulty);
        playLineDraw();
        const previousScores = [...gameState.scores];
        const nextState = play(gameState, move);
        const scored = nextState.scores[gameState.turn] > previousScores[gameState.turn];
        if (scored) {
          playBoxComplete();
          setBonusTurnAlert(true);
          setTimeout(() => setBonusTurnAlert(false), 1200);
        }
        setGameState(nextState);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [isCpuTurn, gameState, difficulty]);

  // Save game on completion
  useEffect(() => {
    if (gameState.done && !saved.current) {
      saved.current = true;
      if (mode !== 'solo') {
        playCricketBoundary(6);
        const winner =
          gameState.scores[0] === gameState.scores[1]
            ? T('tie')
            : `${names[gameState.scores[0] > gameState.scores[1] ? 0 : 1]} ${T('wins')}`;
        onDone({
          id: Date.now().toString(),
          game: 'dots',
          mode,
          date: new Date().toISOString(),
          result: `${gameState.scores[0]} - ${gameState.scores[1]}`,
          details: winner,
        });
      }
    }
  }, [gameState.done]);

  const restartGame = () => {
    saved.current = false;
    setGameState(newGame(gridSize, gridSize));
    setBonusTurnAlert(false);
  };

  const H = (gameState.R + 1) * gameState.C;
  const svgWidth = gameState.C * SPACING + 2 * PADDING;
  const svgHeight = gameState.R * SPACING + 2 * PADDING;

  const getLineCoords = (i: number): [number, number, number, number] => {
    if (i < H) {
      // Horizontal line
      const r = Math.floor(i / gameState.C);
      const c = i % gameState.C;
      return [
        PADDING + c * SPACING,
        PADDING + r * SPACING,
        PADDING + (c + 1) * SPACING,
        PADDING + r * SPACING,
      ];
    }
    // Vertical line
    const j = i - H;
    const r = Math.floor(j / (gameState.C + 1));
    const c = j % (gameState.C + 1);
    return [
      PADDING + c * SPACING,
      PADDING + r * SPACING,
      PADDING + c * SPACING,
      PADDING + (r + 1) * SPACING,
    ];
  };

  const winnerText =
    gameState.scores[0] === gameState.scores[1]
      ? T('tie')
      : `🏆 ${names[gameState.scores[0] > gameState.scores[1] ? 0 : 1]} ${T('wins')}`;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
        <button
          onClick={onExit}
          className="flex items-center gap-1 rounded-xl border border-stone-300 bg-white/80 px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100 active:scale-95"
        >
          <span>←</span>
          <span>{T('back')}</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg font-bold text-emerald-950 sm:text-xl">
            {T('dots')}
          </h2>
          <span className="text-xs font-semibold text-emerald-800">
            {gameState.R}x{gameState.C} Grid • {mode === 'computer' ? `${T('computer')} (${T(difficulty)})` : mode === 'solo' ? T('solo') : T('local')}
          </span>
        </div>

        <button
          onClick={restartGame}
          className="rounded-xl border border-stone-300 bg-white/80 px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100 active:scale-95"
          title={T('rematch')}
        >
          🔄 {T('rematch')}
        </button>
      </div>

      {/* Players Scoreboard & Turn Indicator */}
      <div className="grid grid-cols-2 gap-3">
        {/* Player 1 (Blue Pen) */}
        <div
          className={`rounded-2xl border p-3 transition-all ${
            gameState.turn === 0 && !gameState.done
              ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/50'
              : 'border-stone-200 bg-white/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-600 shadow-sm" />
              <span>{names[0]} (Blue Pen)</span>
            </span>
            {gameState.turn === 0 && !gameState.done && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                {T('turn')}
              </span>
            )}
          </div>
          <div className="mt-1 text-3xl font-black text-blue-900">{gameState.scores[0]}</div>
          <div className="text-xs text-stone-500">Boxes Claimed</div>
        </div>

        {/* Player 2 / Computer (Red Pen) */}
        <div
          className={`rounded-2xl border p-3 transition-all ${
            gameState.turn === 1 && !gameState.done
              ? 'border-rose-600 bg-rose-50/80 shadow-md ring-2 ring-rose-500/50'
              : 'border-stone-200 bg-white/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-600 shadow-sm" />
              <span>{names[1]} (Red Pen)</span>
            </span>
            {gameState.turn === 1 && !gameState.done && (
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                {T('turn')}
              </span>
            )}
          </div>
          <div className="mt-1 text-3xl font-black text-rose-900">{gameState.scores[1]}</div>
          <div className="text-xs text-stone-500">Boxes Claimed</div>
        </div>
      </div>

      {/* Bonus turn notification banner */}
      <div className="h-7 text-center">
        {bonusTurnAlert && (
          <span className="inline-block rounded-full bg-amber-400 px-4 py-1 text-xs font-black text-amber-950 shadow-sm animate-bounce">
            ✨ {T('extraTurn')}
          </span>
        )}
      </div>

      {/* GAME BOARD CANVAS (Ruled Paper + Interactive SVG Grid) */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-stone-300 bg-[#fffdf8] p-4 shadow-lg sm:p-6">
        {/* Ruled blue paper background texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #2563eb, #2563eb 1px, transparent 1px, transparent 24px)',
          }}
        />

        <div className="flex justify-center">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-[380px] filter drop-shadow-sm"
          >
            {/* 1. Claimed Boxes Fills & Stamped Initials */}
            {gameState.owner.map((ownerIdx, boxIdx) => {
              if (ownerIdx === null) return null;
              const r = Math.floor(boxIdx / gameState.C);
              const c = boxIdx % gameState.C;
              const x = PADDING + c * SPACING + 4;
              const y = PADDING + r * SPACING + 4;
              const size = SPACING - 8;

              return (
                <g key={boxIdx} className="animate-fade-in">
                  {/* Textured Ink Fill */}
                  <rect
                    x={x}
                    y={y}
                    width={size}
                    height={size}
                    rx={6}
                    fill={ownerIdx === 0 ? '#dbeafe' : '#ffe4e6'}
                    stroke={ownerIdx === 0 ? '#93c5fd' : '#fca5a5'}
                    strokeWidth={1.5}
                  />
                  {/* Stamped Player Symbol */}
                  <text
                    x={x + size / 2}
                    y={y + size / 2 + 7}
                    textAnchor="middle"
                    fontSize={22}
                    fontWeight="900"
                    fontFamily="sans-serif"
                    fill={ownerIdx === 0 ? '#1e40af' : '#be123c'}
                    opacity={0.9}
                  >
                    {ownerIdx === 0 ? 'A' : 'B'}
                  </text>
                </g>
              );
            })}

            {/* 2. Grid Lines (Horizontal & Vertical) */}
            {gameState.lines.map((isDrawn, lineIdx) => {
              const [x1, y1, x2, y2] = getLineCoords(lineIdx);
              const isHovered = hoverLine === lineIdx && !isDrawn;
              const lineOwner = gameState.lineOwners?.[lineIdx];

              const strokeColor = isDrawn
                ? lineOwner === 0
                  ? '#2563eb' // Player 1 Blue Pen
                  : lineOwner === 1
                  ? '#e11d48' // Player 2 / CPU Red Pen
                  : '#0f172a'
                : isHovered
                ? gameState.turn === 0
                  ? '#93c5fd'
                  : '#fca5a5'
                : '#e2e8f0';

              return (
                <g key={lineIdx}>
                  {/* Drawn or Hover Line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={isDrawn ? 4.5 : isHovered ? 3.5 : 2}
                    strokeLinecap="round"
                    strokeDasharray={isHovered ? '4,4' : undefined}
                    className="transition-colors duration-150"
                  />

                  {/* Wide invisible click target for easy mobile tapping */}
                  {!isDrawn && !isCpuTurn && !gameState.done && (
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="transparent"
                      strokeWidth={32}
                      style={{cursor: 'pointer'}}
                      onMouseEnter={() => setHoverLine(lineIdx)}
                      onMouseLeave={() => setHoverLine(null)}
                      onClick={() => handleLineClick(lineIdx)}
                    />
                  )}
                </g>
              );
            })}

            {/* 3. Grid Dots */}
            {Array.from({length: (gameState.R + 1) * (gameState.C + 1)}, (_, k) => {
              const r = Math.floor(k / (gameState.C + 1));
              const c = k % (gameState.C + 1);
              const cx = PADDING + c * SPACING;
              const cy = PADDING + r * SPACING;

              return (
                <circle
                  key={k}
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill="#1e293b"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  className="filter drop-shadow-sm"
                />
              );
            })}
          </svg>
        </div>

        {/* Turn Status / Game Over */}
        <div className="mt-4 text-center">
          {gameState.done ? (
            <div className="space-y-2">
              <div className="text-xl font-black text-emerald-800">{winnerText}</div>
              <button
                onClick={restartGame}
                className="rounded-2xl bg-emerald-700 px-6 py-2.5 font-bold text-white shadow hover:bg-emerald-800 active:scale-95"
              >
                🔄 {T('rematch')}
              </button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-stone-500">
              {isCpuTurn
                ? T('computerThinking')
                : `${names[gameState.turn]}: Tap any dotted line to connect!`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
