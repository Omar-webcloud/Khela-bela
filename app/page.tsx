'use client';

import React, {useEffect, useState} from 'react';
import {Lang, t} from '@/lib/i18n';
import type {Mode, Diff, Summary, HouseRules} from '@/lib/types';
import {
  getPref,
  setPref,
  saveMatch,
  listMatches,
  clearMatches,
  getHouseRules,
  setHouseRules,
  exportAllData,
  importData,
} from '@/lib/storage';
import {setSoundEnabled, isSoundEnabled, playPenClick} from '@/lib/audio';
import Cricket from '@/components/Cricket';
import ChorPolice from '@/components/ChorPolice';
import Dots from '@/components/Dots';

export default function Home() {
  const [lang, setLang] = useState<Lang>('en');
  const [mode, setMode] = useState<Mode>('computer');
  const [diff, setDiff] = useState<Diff>('medium');
  const [sound, setSound] = useState(true);
  const [houseRules, setHouseRulesState] = useState<HouseRules>(getHouseRules);
  const [showSettings, setShowSettings] = useState(false);
  const [game, setGame] = useState<string | null>(null);
  const [history, setHistory] = useState<Summary[]>([]);
  const [importStatus, setImportStatus] = useState<string>('');

  useEffect(() => {
    const savedLang = getPref<Lang>('lang', 'en');
    const savedDiff = getPref<Diff>('diff', 'medium');
    const savedMode = getPref<Mode>('mode', 'computer');
    const savedSound = getPref<boolean>('sound', true);

    setLang(savedLang);
    setDiff(savedDiff);
    setMode(savedMode);
    setSound(savedSound);
    setSoundEnabled(savedSound);
    setHouseRulesState(getHouseRules());

    listMatches().then(setHistory);
  }, []);

  const T = (k: string) => t(lang, k);

  const toggleLang = () => {
    playPenClick();
    const nextLang = lang === 'en' ? 'bn' : 'en';
    setLang(nextLang);
    setPref('lang', nextLang);
  };

  const toggleSound = () => {
    const nextSound = !sound;
    setSound(nextSound);
    setSoundEnabled(nextSound);
    setPref('sound', nextSound);
    if (nextSound) playPenClick();
  };

  const handleSelectMode = (newMode: Mode) => {
    playPenClick();
    setMode(newMode);
    setPref('mode', newMode);
  };

  const handleSelectDiff = (newDiff: Diff) => {
    playPenClick();
    setDiff(newDiff);
    setPref('diff', newDiff);
  };

  const handleMatchDone = async (summary: Summary) => {
    await saveMatch(summary);
    const updated = await listMatches();
    setHistory(updated);
  };

  const handleClearHistory = async () => {
    if (window.confirm(lang === 'bn' ? 'সব খেলার ইতিহাস মুছে ফেলতে চান?' : 'Clear all match history?')) {
      await clearMatches();
      setHistory([]);
    }
  };

  const handleExportJSON = async () => {
    playPenClick();
    const jsonStr = await exportAllData();
    const blob = new Blob([jsonStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khelabela-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importData(content);
      if (success) {
        setImportStatus(lang === 'bn' ? '✅ ইতিহাস সফলভাবে ইমপোর্ট হয়েছে!' : '✅ Data imported successfully!');
        const updated = await listMatches();
        setHistory(updated);
        setHouseRulesState(getHouseRules());
      } else {
        setImportStatus(lang === 'bn' ? '❌ ফাইল ত্রুটিপূর্ণ' : '❌ Failed to parse JSON file');
      }
      setTimeout(() => setImportStatus(''), 4000);
    };
    reader.readAsText(file);
  };

  const updateRule = (key: keyof HouseRules, value: number) => {
    playPenClick();
    const updated = setHouseRules({[key]: value});
    setHouseRulesState(updated);
  };

  const gameProps = {
    lang,
    mode,
    difficulty: diff,
    soundEnabled: sound,
    houseRules,
    onExit: () => setGame(null),
    onDone: handleMatchDone,
  };

  if (game === 'cricket') return <Cricket {...gameProps} />;
  if (game === 'chor') return <ChorPolice {...gameProps} />;
  if (game === 'dots') return <Dots {...gameProps} />;

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-8">
      {/* App Header & Controls */}
      <header className="flex items-center justify-between border-b border-stone-300/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📓</span>
            <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
              {T('appTitle')}
            </h1>
          </div>
          <p className="text-xs text-stone-600 sm:text-sm">{T('tagline')}</p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-300 bg-white shadow-sm hover:bg-stone-100 active:scale-95"
            title={sound ? T('soundOn') : T('soundOff')}
          >
            {sound ? '🔊' : '🔇'}
          </button>

          {/* Settings & House Rules */}
          <button
            onClick={() => {
              playPenClick();
              setShowSettings(true);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-300 bg-white shadow-sm hover:bg-stone-100 active:scale-95"
            title={T('rulesSettings')}
          >
            ⚙️
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="rounded-xl border border-emerald-800 bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 active:scale-95"
          >
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </header>

      {/* Mode & Difficulty Selector Card */}
      <section className="notebook-card p-4 space-y-3">
        {/* Game Mode Selector */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
            <span>{T('mode')}</span>
            <span className="text-[11px] font-normal text-stone-400">
              {mode === 'computer' ? '🤖 Play vs AI' : mode === 'local' ? '👥 Pass device' : '🎯 Free play'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['computer', 'local', 'solo'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => handleSelectMode(m)}
                className={`rounded-xl py-2 px-1 text-center text-xs font-bold transition-all ${
                  mode === m
                    ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-600/50 scale-[1.02]'
                    : 'border border-stone-200 bg-stone-50/80 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {T(m)}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selector (Visible when mode is 'computer') */}
        {mode === 'computer' && (
          <div className="pt-2 border-t border-stone-100 animate-fade-in">
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
              {T('difficulty')}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Diff[]).map(d => (
                <button
                  key={d}
                  onClick={() => handleSelectDiff(d)}
                  className={`rounded-xl py-1.5 text-center text-xs font-bold transition-all ${
                    diff === d
                      ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-500/50'
                      : 'border border-stone-200 bg-stone-50/80 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {T(d)}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* THREE MAIN GAME CARDS */}
      <section className="space-y-3">
        {/* 1. Paper Cricket */}
        <div
          onClick={() => {
            playPenClick();
            setGame('cricket');
          }}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-emerald-900/15 bg-white p-5 shadow-md transition-all hover:-translate-y-1 hover:border-emerald-700 hover:shadow-xl active:scale-[0.99]"
        >
          {/* Top Ruled Paper Accent */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-2xl shadow-sm">
                  🏏
                </span>
                <div>
                  <h3 className="text-xl font-black text-stone-900 group-hover:text-emerald-800 transition-colors">
                    {T('cricket')}
                  </h3>
                  <div className="text-xs font-medium text-emerald-700">{T('cricketSub')}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                {lang === 'bn'
                  ? 'খাতার পাতায় আঁকা ঘড়ির ডায়ালে ১২ টায় ৬ এবং ৩ ও ৯ টায় ৪! আসল কলম ঘুরিয়ে রান ও উইকেটের রোমাঞ্চ।'
                  : 'Flick an authentic ballpoint pen inside a 12-hour clock dial with 6s and 4s! Bowl deliveries, chase targets, and win.'}
              </p>
            </div>

            <span className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
              Play →
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-stone-500">
            <span className="rounded-md bg-stone-100 px-2 py-0.5">⏱️ 12-Hour Dial</span>
            <span className="rounded-md bg-amber-100 text-amber-900 px-2 py-0.5">🌟 6s & 4s Clock</span>
            <span className="rounded-md bg-stone-100 px-2 py-0.5">🖊️ Real Pen Physics</span>
          </div>
        </div>

        {/* 2. Chor Police */}
        <div
          onClick={() => {
            playPenClick();
            setGame('chor');
          }}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-amber-900/15 bg-white p-5 shadow-md transition-all hover:-translate-y-1 hover:border-amber-600 hover:shadow-xl active:scale-[0.99]"
        >
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-2xl shadow-sm">
                  ✉️
                </span>
                <div>
                  <h3 className="text-xl font-black text-stone-900 group-hover:text-amber-800 transition-colors">
                    {T('chor')}
                  </h3>
                  <div className="text-xs font-medium text-amber-700">{T('chorSub')}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                {lang === 'bn'
                  ? 'রাজা, মন্ত্রী, পুলিশ, চোর — চার চিরকুটের ক্লাসিক খেলা। পুলিশকে সঠিক চোর খুঁজে বের করতে হবে!'
                  : 'Raja (1000), Mantri (800), Police (500), Chor (0)! Secret folded paper slips, court dialogues, and undercover guesses.'}
              </p>
            </div>

            <span className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm">
              Play →
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-stone-500">
            <span className="rounded-md bg-stone-100 px-2 py-0.5">👑 Raja (1000)</span>
            <span className="rounded-md bg-stone-100 px-2 py-0.5">📜 Mantri (800)</span>
            <span className="rounded-md bg-stone-100 px-2 py-0.5">👮 Police (500)</span>
            <span className="rounded-md bg-stone-100 px-2 py-0.5">🎭 Chor</span>
          </div>
        </div>

        {/* 3. Dots and Boxes */}
        <div
          onClick={() => {
            playPenClick();
            setGame('dots');
          }}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-blue-900/15 bg-white p-5 shadow-md transition-all hover:-translate-y-1 hover:border-blue-600 hover:shadow-xl active:scale-[0.99]"
        >
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-2xl shadow-sm">
                  ▦
                </span>
                <div>
                  <h3 className="text-xl font-black text-stone-900 group-hover:text-blue-800 transition-colors">
                    {T('dots')}
                  </h3>
                  <div className="text-xs font-medium text-blue-700">{T('dotsSub')}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                {lang === 'bn'
                  ? 'খাতার পাতায় ডটস অ্যান্ড বক্সেস। দাগ টেনে ঘর পূরণ করুন, বোনাস চাল নিন এবং প্রতিপক্ষকে হারান।'
                  : 'The nostalgic grid game on ruled paper! Blue and red pen lines, box completion stamps, and extra turn combos.'}
              </p>
            </div>

            <span className="rounded-xl border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 shadow-sm">
              Play →
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-stone-500">
            <span className="rounded-md bg-stone-100 px-2 py-0.5">🖊️ Blue vs Red Pen</span>
            <span className="rounded-md bg-stone-100 px-2 py-0.5">⚡ Extra Turn Combos</span>
            <span className="rounded-md bg-stone-100 px-2 py-0.5">🧠 3 AI Difficulties</span>
          </div>
        </div>
      </section>

      {/* Match History */}
      <section className="notebook-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
          <div className="flex items-center gap-2 font-bold text-stone-800 text-sm">
            <span>📜</span>
            <span>{T('history')}</span>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              {T('clearHistory')}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-2 text-center">{T('none')}</p>
        ) : (
          <div className="space-y-2">
            {history.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50/60 p-2.5 text-xs transition-all hover:bg-stone-50"
              >
                <div>
                  <div className="font-bold text-stone-800">
                    {item.game === 'cricket'
                      ? `🏏 ${T('cricket')}`
                      : item.game === 'chor'
                      ? `✉️ ${T('chor')}`
                      : `▦ ${T('dots')}`}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {item.date ? new Date(item.date).toLocaleDateString() : ''} • {T(item.mode)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-800">{item.result}</div>
                  {item.details && <div className="text-[10px] text-stone-500">{item.details}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer Info */}
      <footer className="text-center text-xs text-stone-500 space-y-1">
        <p>🔒 {T('offline')}</p>
        <p className="text-[11px] text-stone-400">Bangladeshi Paper Games Collection • Local-Only v3.0</p>
      </footer>

      {/* SETTINGS & HOUSE RULES MODAL (FR-14 & FR-15) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-stone-300 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <span>⚙️</span>
                <span>{T('rulesSettings')}</span>
              </h2>
              <button
                onClick={() => {
                  playPenClick();
                  setShowSettings(false);
                }}
                className="h-8 w-8 rounded-full border border-stone-200 text-sm font-bold text-stone-500 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            {/* House Rules Configuration */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {T('houseRules')}
              </h3>

              {/* Cricket Overs / Balls */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-800">{T('oversLength')}</div>
                  <div className="text-[11px] text-stone-500">Number of balls per innings</div>
                </div>
                <div className="flex gap-1">
                  {[6, 12, 18, 24].map(b => (
                    <button
                      key={b}
                      onClick={() => updateRule('cricketBalls', b)}
                      className={`h-8 w-9 rounded-lg text-xs font-bold ${
                        houseRules.cricketBalls === b
                          ? 'bg-emerald-700 text-white'
                          : 'border border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cricket Wickets Limit */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-800">{T('wicketsLimit')}</div>
                  <div className="text-[11px] text-stone-500">Wickets allowed per team</div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 5].map(w => (
                    <button
                      key={w}
                      onClick={() => updateRule('cricketWickets', w)}
                      className={`h-8 w-9 rounded-lg text-xs font-bold ${
                        houseRules.cricketWickets === w
                          ? 'bg-emerald-700 text-white'
                          : 'border border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chor Police Rounds */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-800">{T('chorRoundsCount')}</div>
                  <div className="text-[11px] text-stone-500">Total rounds to play</div>
                </div>
                <div className="flex gap-1">
                  {[3, 5, 7, 10].map(r => (
                    <button
                      key={r}
                      onClick={() => updateRule('chorRounds', r)}
                      className={`h-8 w-9 rounded-lg text-xs font-bold ${
                        houseRules.chorRounds === r
                          ? 'bg-amber-600 text-white'
                          : 'border border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dots Grid Size */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-800">{T('gridSize')}</div>
                  <div className="text-[11px] text-stone-500">Boxes dimension</div>
                </div>
                <div className="flex gap-1">
                  {[3, 4, 5].map(s => (
                    <button
                      key={s}
                      onClick={() => updateRule('dotsSize', s)}
                      className={`h-8 w-11 rounded-lg text-xs font-bold ${
                        houseRules.dotsSize === s
                          ? 'bg-blue-600 text-white'
                          : 'border border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      {s}x{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* JSON Data Export / Import (FR-15) */}
            <div className="border-t border-stone-200 pt-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                JSON Data Backup & Restore
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={handleExportJSON}
                  className="flex-1 rounded-xl border border-stone-300 bg-stone-50 py-2 text-xs font-bold text-stone-800 shadow-sm hover:bg-stone-100"
                >
                  📥 {T('exportData')}
                </button>

                <label className="flex-1 cursor-pointer rounded-xl border border-stone-300 bg-stone-50 py-2 text-center text-xs font-bold text-stone-800 shadow-sm hover:bg-stone-100">
                  <span>📤 {T('importData')}</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportJSON}
                  />
                </label>
              </div>

              {importStatus && (
                <div className="rounded-lg bg-emerald-50 p-2 text-center text-xs font-semibold text-emerald-800">
                  {importStatus}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                playPenClick();
                setShowSettings(false);
              }}
              className="w-full rounded-2xl bg-emerald-700 py-3 font-bold text-white shadow-md hover:bg-emerald-800 active:scale-95"
            >
              {T('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
