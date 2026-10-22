'use client';

import React, {useEffect, useRef, useState} from 'react';
import {Lang, t} from '@/lib/i18n';
import type {GameProps} from '@/lib/types';
import {newGame, play, DB} from '@/lib/games/dots-and-boxes/engine';
import {pickMove} from '@/lib/games/dots-and-boxes/computer';
import {playLineDraw, playBoxComplete, playCricketBoundary} from '@/lib/audio';

const SPACING = 68;
const PADDING = 28;

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
      const r = Math.floor(i / gameState.C);
      const c = i % gameState.C;
      return [
        PADDING + c * SPACING,
        PADDING + r * SPACING,
        PADDING + (c + 1) * SPACING,
        PADDING + r * SPACING,
      ];
    }
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
      : `${names[gameState.scores[0] > gameState.scores[1] ? 0 : 1]} ${T('wins')}`;

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
          <h2 className="text-base font-bold text-stone-900">{T('dots')}</h2>
          <span className="text-[11px] text-stone-500 font-medium">
            {gameState.R}x{gameState.C} • {mode === 'computer' ? `${T('computer')} (${T(difficulty)})` : mode === 'solo' ? T('solo') : T('local')}
          </span>
        </div>

        <button
          onClick={restartGame}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 active:scale-95"
        >
          {T('rematch')}
        </button>
      </div>

      {/* Unified Turn & Status Banner - Fixed Height to prevent layout shifts */}
      <div
        className={`flex h-11 items-center justify-between rounded-xl px-3.5 text-xs font-semibold shadow-xs transition-colors duration-200 ${
          gameState.done
            ? 'bg-amber-600 text-white'
            : bonusTurnAlert
            ? 'bg-emerald-600 text-white'
            : gameState.turn === 0
            ? 'bg-blue-600 text-white'
            : 'bg-stone-900 text-white'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {gameState.done ? (
            <span className="truncate">🏆 {winnerText}</span>
          ) : bonusTurnAlert ? (
            <span className="flex items-center gap-1.5 animate-pulse truncate font-bold">
              <span>🎉</span>
              <span>{lang === 'bn' ? 'ঘর পূরণ হয়েছে! বোনাস চাল!' : 'Box claimed! Bonus turn!'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 truncate">
              <span
                className={`h-2.5 w-2.5 rounded-full ring-2 ring-white/50 ${
                  gameState.turn === 0 ? 'bg-blue-300' : 'bg-rose-400'
                }`}
              />
              <span className="truncate">
                {gameState.turn === 0
                  ? lang === 'bn'
                    ? 'আপনার চাল (নীল দাগ)'
                    : 'Your turn (Blue pen)'
                  : isCpuTurn
                  ? lang === 'bn'
                    ? 'কম্পিউটার ভাবছে...'
                    : 'Computer is playing...'
                  : lang === 'bn'
                  ? 'খেলোয়াড় ২ এর চাল'
                  : "Player 2's turn"}
              </span>
            </span>
          )}
        </div>

        <span className="shrink-0 rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium backdrop-blur-xs">
          {gameState.done
            ? names[gameState.scores[0] > gameState.scores[1] ? 0 : 1]
            : names[gameState.turn]}
        </span>
      </div>

      {/* Clean Scorecard */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          className={`rounded-xl border p-2.5 transition ${
            gameState.turn === 0 && !gameState.done
              ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500/20'
              : 'border-stone-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span>{names[0]}</span>
            </span>
            <span className="text-[10px] text-stone-400">P1</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">{gameState.scores[0]}</div>
          <div className="text-[10px] text-stone-500">দখলকৃত ঘর</div>
        </div>

        <div
          className={`rounded-xl border p-2.5 transition ${
            gameState.turn === 1 && !gameState.done
              ? 'border-stone-900 bg-stone-100 ring-1 ring-stone-900/10'
              : 'border-stone-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
              <span>{names[1]}</span>
            </span>
            <span className="text-[10px] text-stone-400">P2</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">{gameState.scores[1]}</div>
          <div className="text-[10px] text-stone-500">দখলকৃত ঘর</div>
        </div>
      </div>

      {/* Clean Board Canvas */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex justify-center">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-[340px] select-none"
          >
            {/* 1. Claimed Boxes */}
            {gameState.owner.map((ownerIdx, boxIdx) => {
              if (ownerIdx === null) return null;
              const r = Math.floor(boxIdx / gameState.C);
              const c = boxIdx % gameState.C;
              const x = PADDING + c * SPACING + 4;
              const y = PADDING + r * SPACING + 4;
              const size = SPACING - 8;

              return (
                <g key={boxIdx} className="animate-fade-in">
                  <rect
                    x={x}
                    y={y}
                    width={size}
                    height={size}
                    rx={6}
                    fill={ownerIdx === 0 ? '#eff6ff' : '#f5f5f4'}
                    stroke={ownerIdx === 0 ? '#bfdbfe' : '#e7e5e4'}
                    strokeWidth={1}
                  />
                  <text
                    x={x + size / 2}
                    y={y + size / 2 + 6}
                    textAnchor="middle"
                    fontSize={18}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    fill={ownerIdx === 0 ? '#2563eb' : '#44403c'}
                  >
                    {ownerIdx === 0 ? 'A' : 'B'}
                  </text>
                </g>
              );
            })}

            {/* 2. Grid Lines */}
            {gameState.lines.map((isDrawn, lineIdx) => {
              const [x1, y1, x2, y2] = getLineCoords(lineIdx);
              const isHovered = hoverLine === lineIdx && !isDrawn;
              const lineOwner = gameState.lineOwners?.[lineIdx];

              const strokeColor = isDrawn
                ? lineOwner === 0
                  ? '#2563eb'
                  : '#dc2626'
                : isHovered
                ? gameState.turn === 0
                  ? '#93c5fd'
                  : '#fca5a5'
                : '#e7e5e4';

              return (
                <g key={lineIdx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={isDrawn ? 4 : isHovered ? 3 : 2}
                    strokeLinecap="round"
                    strokeDasharray={isHovered ? '4,4' : undefined}
                    className="transition-colors"
                  />

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
                  r={4.5}
                  fill="#1c1917"
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              );
            })}
          </svg>
        </div>

        {/* Bottom Action & Hint Bar - Fixed Height to prevent jumping */}
        <div className="mt-3 flex h-10 items-center justify-center text-center">
          {gameState.done ? (
            <button
              onClick={restartGame}
              className="w-full max-w-xs rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800 active:scale-95 shadow-xs"
            >
              {T('rematch')}
            </button>
          ) : (
            <span className="text-[11px] font-medium text-stone-500">
              {isCpuTurn
                ? T('computerThinking')
                : lang === 'bn'
                ? 'ডটের মাঝে চাপ দিয়ে দাগ টানুন'
                : 'Tap between dots to draw lines'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
