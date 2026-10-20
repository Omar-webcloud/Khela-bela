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
import {setSoundEnabled, playPenClick} from '@/lib/audio';
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
    if (window.confirm(lang === 'bn' ? 'খেলার ইতিহাস মুছতে চান?' : 'Clear match history?')) {
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
        setImportStatus(lang === 'bn' ? 'ইতিহাস সফলভাবে ইমপোর্ট হয়েছে' : 'Data imported successfully');
        const updated = await listMatches();
        setHistory(updated);
        setHouseRulesState(getHouseRules());
      } else {
        setImportStatus(lang === 'bn' ? 'ফাইল পড়া যায়নি' : 'Invalid JSON file');
      }
      setTimeout(() => setImportStatus(''), 3000);
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
    <div className="mx-auto max-w-lg space-y-4 pb-8">
      {/* Clean Minimal Header */}
      <header className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            {T('appTitle')}
          </h1>
          <p className="text-xs text-stone-500">{T('tagline')}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-sm text-stone-700 transition hover:bg-stone-50 active:scale-95"
            title={sound ? T('soundOn') : T('soundOff')}
          >
            {sound ? '🔊' : '🔇'}
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => {
              playPenClick();
              setShowSettings(true);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-sm text-stone-700 transition hover:bg-stone-50 active:scale-95"
            title={T('rulesSettings')}
          >
            ⚙️
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:bg-stone-50 active:scale-95"
          >
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </header>

      {/* Mode & Difficulty Selector */}
      <section className="rounded-xl border border-stone-200 bg-white p-3 space-y-3 shadow-xs">
        {/* Mode Selector */}
        <div>
          <div className="mb-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {T('mode')}
          </div>
          <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-stone-100 p-1">
            {(['computer', 'local', 'solo'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => handleSelectMode(m)}
                className={`rounded-md py-1.5 text-center text-xs font-semibold transition ${
                  mode === m
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {T(m)}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty (Computer Mode only) */}
        {mode === 'computer' && (
          <div className="pt-2 border-t border-stone-100 animate-fade-in">
            <div className="mb-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {T('difficulty')}
            </div>
            <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-stone-100 p-1">
              {(['easy', 'medium', 'hard'] as Diff[]).map(d => (
                <button
                  key={d}
                  onClick={() => handleSelectDiff(d)}
                  className={`rounded-md py-1.5 text-center text-xs font-semibold transition ${
                    diff === d
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {T(d)}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Clean Game Cards */}
      <section className="space-y-2.5">
        {/* 1. Paper Cricket */}
        <div
          onClick={() => {
            playPenClick();
            setGame('cricket');
          }}
          className="group cursor-pointer rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-emerald-600 hover:shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-xl text-stone-700">
                🏏
              </span>
              <div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-700 transition">
                  {T('cricket')}
                </h3>
                <p className="text-xs text-stone-500">{T('cricketSub')}</p>
              </div>
            </div>

            <span className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition">
              {lang === 'bn' ? 'খেলুন →' : 'Play →'}
            </span>
          </div>
        </div>

        {/* 2. Chor Police */}
        <div
          onClick={() => {
            playPenClick();
            setGame('chor');
          }}
          className="group cursor-pointer rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-emerald-600 hover:shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-xl text-stone-700">
                ✉️
              </span>
              <div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-700 transition">
                  {T('chor')}
                </h3>
                <p className="text-xs text-stone-500">{T('chorSub')}</p>
              </div>
            </div>

            <span className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition">
              {lang === 'bn' ? 'খেলুন →' : 'Play →'}
            </span>
          </div>
        </div>

        {/* 3. Dots and Boxes */}
        <div
          onClick={() => {
            playPenClick();
            setGame('dots');
          }}
          className="group cursor-pointer rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-emerald-600 hover:shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-xl text-stone-700">
                ▦
              </span>
              <div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-700 transition">
                  {T('dots')}
                </h3>
                <p className="text-xs text-stone-500">{T('dotsSub')}</p>
              </div>
            </div>

            <span className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition">
              {lang === 'bn' ? 'খেলুন →' : 'Play →'}
            </span>
          </div>
        </div>
      </section>

      {/* Match History */}
      <section className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
            {T('history')}
          </span>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[11px] text-stone-400 hover:text-stone-700"
            >
              {T('clearHistory')}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-stone-400 py-1">{T('none')}</p>
        ) : (
          <div className="space-y-1.5">
            {history.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-stone-800">
                    {item.game === 'cricket'
                      ? T('cricket')
                      : item.game === 'chor'
                      ? T('chor')
                      : T('dots')}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {item.date ? new Date(item.date).toLocaleDateString() : ''} • {T(item.mode)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-stone-900">{item.result}</div>
                  {item.details && <div className="text-[10px] text-stone-500">{item.details}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Clean Footer */}
      <footer className="text-center text-xs text-stone-400 pt-2">
        <p>{T('offline')}</p>
      </footer>

      {/* Clean Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h2 className="text-base font-bold text-stone-900">{T('rulesSettings')}</h2>
              <button
                onClick={() => {
                  playPenClick();
                  setShowSettings(false);
                }}
                className="h-7 w-7 rounded-lg border border-stone-200 text-xs font-semibold text-stone-500 hover:bg-stone-50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Cricket balls */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-700">{T('oversLength')}</span>
                <div className="flex gap-1">
                  {[6, 12, 18, 24].map(b => (
                    <button
                      key={b}
                      onClick={() => updateRule('cricketBalls', b)}
                      className={`h-7 w-8 rounded-md font-semibold transition ${
                        houseRules.cricketBalls === b
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cricket wickets */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-700">{T('wicketsLimit')}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 5].map(w => (
                    <button
                      key={w}
                      onClick={() => updateRule('cricketWickets', w)}
                      className={`h-7 w-8 rounded-md font-semibold transition ${
                        houseRules.cricketWickets === w
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chor rounds */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-700">{T('chorRoundsCount')}</span>
                <div className="flex gap-1">
                  {[3, 5, 7, 10].map(r => (
                    <button
                      key={r}
                      onClick={() => updateRule('chorRounds', r)}
                      className={`h-7 w-8 rounded-md font-semibold transition ${
                        houseRules.chorRounds === r
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dots grid */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-700">{T('gridSize')}</span>
                <div className="flex gap-1">
                  {[3, 4, 5].map(s => (
                    <button
                      key={s}
                      onClick={() => updateRule('dotsSize', s)}
                      className={`h-7 w-10 rounded-md font-semibold transition ${
                        houseRules.dotsSize === s
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {s}x{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Export & Import */}
            <div className="border-t border-stone-100 pt-3 flex gap-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 rounded-lg border border-stone-200 bg-stone-50 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
              >
                📥 {T('exportData')}
              </button>
              <label className="flex-1 cursor-pointer rounded-lg border border-stone-200 bg-stone-50 py-2 text-center text-xs font-semibold text-stone-700 hover:bg-stone-100">
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
              <div className="text-center text-xs text-stone-600 font-medium">
                {importStatus}
              </div>
            )}

            <button
              onClick={() => {
                playPenClick();
                setShowSettings(false);
              }}
              className="w-full rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800 active:scale-95"
            >
              {T('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
