import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Dices, Copy, Check, Sparkles, X, ArrowUpRight, BookOpen, Layers, AlertCircle, FileText, RefreshCw } from 'lucide-react';

interface WordBankTabProps {
  onAppendToMainPrompt?: (text: string) => void;
}

// Categorized Beautiful Lyric Vocabulary Presets (125+ Curated Poetic Words)
export const LYRIC_PRESETS: Record<string, { name: string; emoji: string; words: string[] }> = {
  atmospheric: {
    name: 'Atmospheric & Celestial',
    emoji: '🌌',
    words: [
      'ethereal', 'labyrinth', 'solitude', 'ephemeral', 'mellifluous',
      'aurora', 'serendipity', 'celestial', 'reverie', 'nostalgia',
      'luminous', 'halcyon', 'twilight', 'petrichor', 'limerence',
      'oblivion', 'sanctuary', 'cascade', 'infinite', 'whisper',
      'stardust', 'horizon', 'eclipse', 'radiance', 'supernal',
      'incandescent', 'nocturnal', 'constellation', 'interstellar'
    ]
  },
  visual: {
    name: 'Visual Imagery',
    emoji: '🎨',
    words: [
      'crimson', 'gilded', 'translucent', 'jagged', 'obsidian',
      'weathered', 'velvet', 'prism', 'shimmer', 'starlight',
      'fractured', 'neon', 'shadows', 'echoes', 'horizon',
      'silver', 'midnight', 'amber', 'golden', 'faded',
      'iridescent', 'sapphire', 'kaleidoscope', 'velvet shadows',
      'crystalline', 'silhouette', 'monochrome', 'opalescent'
    ]
  },
  sensory: {
    name: 'Sensory & Textures',
    emoji: '✨',
    words: [
      'frigid', 'brittle', 'searing', 'honeyed', 'charred',
      'intoxicating', 'whispering', 'resonant', 'velvet warmth', 'burning',
      'melancholy', 'electric glow', 'soft rain', 'heavy reverb', 'subtle crackle',
      'hollow sound', 'silken touch', 'bitter taste', 'crisp air', 'deep groove',
      'velvet silence', 'haunting melody', 'warm embrace', 'frozen pulse', 'quiet storm'
    ]
  },
  verbs: {
    name: 'Evocative Action Verbs',
    emoji: '⚡',
    words: [
      'drifted', 'surged', 'tumbled', 'prowled', 'vanished',
      'gazed', 'murmured', 'pierced', 'echoed', 'faded',
      'shattered', 'bloomed', 'entwined', 'ignited', 'dissolved',
      'lingered', 'scattered', 'haunted', 'collided', 'unraveled',
      'transcended', 'shimmered', 'awakened', 'surrendered', 'mesmerized'
    ]
  },
  emotions: {
    name: 'Emotions & Heartbreak',
    emoji: '❤️',
    words: [
      'bittersweet', 'unspoken', 'yearning', 'wildfire', 'euphoria',
      'heartache', 'reckless', 'sacred', 'vulnerable', 'forever',
      'timeless', 'tender', 'captivated', 'breathless', 'devotion',
      'surrender', 'lonely grace', 'silent echo', 'unbreakable', 'restless',
      'phantom love', 'fragile promises', 'everlasting', 'hidden scars', 'magnetic pull'
    ]
  }
};

// All initial words combined & deduplicated
const ALL_INITIAL_WORDS = Array.from(
  new Set(Object.values(LYRIC_PRESETS).flatMap((cat) => cat.words.map((w) => w.trim().toLowerCase())))
).map((w) => {
  const found = Object.values(LYRIC_PRESETS).flatMap((cat) => cat.words).find((orig) => orig.toLowerCase() === w);
  return found || w;
});

const STORAGE_KEY = 'spark_prompt_word_bank_v1';

export const WordBankTab: React.FC<WordBankTabProps> = ({ onAppendToMainPrompt }) => {
  // Words list state initialized with localStorage persistence or default dictionary
  const [words, setWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to read word bank from localStorage', err);
    }
    return ALL_INITIAL_WORDS;
  });

  // Save words to localStorage whenever updated
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    } catch (err) {
      console.error('Failed to save word bank to localStorage', err);
    }
  }, [words]);

  const [newWordInput, setNewWordInput] = useState<string>('');
  const [bulkInput, setBulkInput] = useState<string>('');
  const [showBulkMode, setShowBulkMode] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(4);
  const [generatedResult, setGeneratedResult] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [appended, setAppended] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Status notification state
  const [notification, setNotification] = useState<{ text: string; type: 'info' | 'warning' | 'success' } | null>(null);

  const showStatus = useCallback((text: string, type: 'info' | 'warning' | 'success' = 'info') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // Helper to check if a word exists (case-insensitive)
  const isDuplicate = useCallback((wordToCheck: string, currentList: string[]): boolean => {
    const target = wordToCheck.trim().toLowerCase();
    return currentList.some((w) => w.trim().toLowerCase() === target);
  }, []);

  // Add single word handler with duplicate detection
  const handleAddWord = useCallback(() => {
    const trimmed = newWordInput.trim();
    if (!trimmed) return;

    if (isDuplicate(trimmed, words)) {
      showStatus(`Kata "${trimmed}" sudah ada di dalam Word Bank!`, 'warning');
      return;
    }

    setWords((prev) => [trimmed, ...prev]);
    setNewWordInput('');
    showStatus(`Berhasil menambahkan "${trimmed}"!`, 'success');
  }, [newWordInput, words, isDuplicate, showStatus]);

  // Add Bulk Words handler (comma, newline, or semicolon separated)
  const handleAddBulkWords = useCallback(() => {
    if (!bulkInput.trim()) return;

    // Split by commas, newlines, or semicolons
    const rawItems = bulkInput
      .split(/[,\n;]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (rawItems.length === 0) return;

    const existingMap = new Set(words.map((w) => w.toLowerCase()));
    const uniqueAdded: string[] = [];
    let duplicateCount = 0;

    for (const item of rawItems) {
      const lower = item.toLowerCase();
      if (existingMap.has(lower)) {
        duplicateCount++;
      } else {
        existingMap.add(lower);
        uniqueAdded.push(item);
      }
    }

    if (uniqueAdded.length === 0) {
      showStatus(`Semua ${rawItems.length} kata dari masukan bulk sudah ada di Word Bank!`, 'warning');
      return;
    }

    setWords((prev) => [...uniqueAdded, ...prev]);
    setBulkInput('');
    setShowBulkMode(false);
    showStatus(
      `Berhasil menambahkan ${uniqueAdded.length} kata baru secara bulk! ${
        duplicateCount > 0 ? `(${duplicateCount} kata duplikat dilewati)` : ''
      }`,
      'success'
    );
  }, [bulkInput, words, showStatus]);

  // Load a specific category preset into the bank with deduplication
  const handleLoadPresetCategory = useCallback((catKey: string) => {
    const catWords = LYRIC_PRESETS[catKey]?.words || [];
    setWords((prev) => {
      const existingMap = new Set(prev.map((w) => w.toLowerCase()));
      const uniqueNew = catWords.filter((w) => !existingMap.has(w.toLowerCase()));
      if (uniqueNew.length === 0) {
        showStatus(`Semua kata dari kategori ${LYRIC_PRESETS[catKey]?.name} sudah ada di Word Bank!`, 'warning');
      } else {
        showStatus(`Menambahkan ${uniqueNew.length} kata dari kategori ${LYRIC_PRESETS[catKey]?.name}!`, 'success');
      }
      return [...uniqueNew, ...prev];
    });
    setActiveCategoryFilter(catKey);
  }, [showStatus]);

  // Load all presets deduplicated
  const handleLoadAllPresets = useCallback(() => {
    setWords(ALL_INITIAL_WORDS);
    setActiveCategoryFilter(null);
    showStatus('Word Bank di-reset ke dictionary bawaan (125+ kata puitis)!', 'success');
  }, [showStatus]);

  // Remove single word handler
  const handleRemoveWord = useCallback((indexToRemove: number) => {
    setWords((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }, []);

  // Clear ALL words from the Word Bank
  const handleClearAll = useCallback(() => {
    setWords([]);
    setGeneratedResult([]);
    showStatus('Seluruh kata di Word Bank telah dihapus (Word Bank Kosong)!', 'info');
  }, [showStatus]);

  // Generate random words handler for lyric inspiration (strictly unique)
  const handleGenerateRandom = useCallback(() => {
    if (words.length === 0) return;
    
    // Deduplicate words pool first
    const uniquePool = Array.from(
      new Map(words.map((w) => [w.toLowerCase(), w])).values()
    );

    const countToPick = Math.min(wordCount, uniquePool.length);
    const shuffled = [...uniquePool];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, countToPick);
    setGeneratedResult(selected);
    setAppended(false);
  }, [words, wordCount]);

  // Copy generated words to clipboard
  const handleCopy = useCallback(() => {
    if (generatedResult.length === 0) return;
    const textToCopy = generatedResult.join(', ');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [generatedResult]);

  // Append generated words to main style prompt
  const handleAppendToMain = useCallback(() => {
    if (generatedResult.length === 0 || !onAppendToMainPrompt) return;
    onAppendToMainPrompt(generatedResult.join(', '));
    setAppended(true);
    setTimeout(() => setAppended(false), 2000);
  }, [generatedResult, onAppendToMainPrompt]);

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-950/40 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider text-white uppercase">
                LYRIC WORD BANK & INSPIRATION
              </h2>
              <p className="text-xs text-zinc-300">
                Curate beautiful, evocative vocabulary for song lyric writing with automatic duplicate detection & bulk import.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBulkMode(!showBulkMode)}
            className={`hidden sm:inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
              showBulkMode
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-white/10 text-purple-300 border-white/10 hover:bg-white/20'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{showBulkMode ? 'Single Word Mode' : '+ Add Bulk Words'}</span>
          </button>
        </div>

        {/* Quick Category Loader Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider mr-1">
            Quick Categories:
          </span>
          <button
            onClick={handleLoadAllPresets}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeCategoryFilter === null
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/10 text-zinc-300 hover:bg-white/20'
            }`}
          >
            ✨ All 125+ Lyric Words
          </button>
          {Object.entries(LYRIC_PRESETS).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => handleLoadPresetCategory(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeCategoryFilter === key
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/10 text-zinc-300 hover:bg-white/20'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-bold backdrop-blur-md animate-bounce ${
            notification.type === 'warning'
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              : notification.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-purple-500/40 bg-purple-500/10 text-purple-300'
          }`}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* 1. Add Single Word & Add Bulk Words Panel */}
      <div className="glass-card relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e0c1d] p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-black tracking-widest text-zinc-100 uppercase">
              {showBulkMode ? 'ADD BULK WORDS (MULTIPLE)' : 'ADD CUSTOM LYRIC WORD OR PHRASE'}
            </h3>
          </div>
          <button
            onClick={() => setShowBulkMode(!showBulkMode)}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 underline"
          >
            {showBulkMode ? 'Switch to single word input' : 'Switch to bulk paste mode'}
          </button>
        </div>

        {showBulkMode ? (
          /* Bulk Input Form */
          <div className="space-y-3">
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              rows={4}
              placeholder="Paste multiple words or phrases separated by commas or lines...&#10;Example:&#10;ethereal glow, golden stardust, endless summer&#10;velvet silence, ocean echoes"
              className="w-full resize-none rounded-xl border border-white/10 bg-[#070712] p-4 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/50"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setBulkInput('')}
                disabled={!bulkInput.trim()}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-300 transition hover:bg-white/15 disabled:opacity-40"
              >
                Clear Text
              </button>
              <button
                onClick={handleAddBulkWords}
                disabled={!bulkInput.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              >
                <FileText className="h-4 w-4" />
                <span>Add Bulk Words</span>
              </button>
            </div>
          </div>
        ) : (
          /* Single Word Form */
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newWordInput}
              onChange={(e) => setNewWordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
              placeholder="Type a lyric word or phrase (e.g. golden horizon, silent teardrops)..."
              className="flex-1 rounded-xl border border-white/10 bg-[#070712] px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/50"
            />
            <button
              onClick={handleAddWord}
              disabled={!newWordInput.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              <span>Add Word</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Word Bank Collection */}
      <div className="glass-card relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d1a] p-5 shadow-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black tracking-widest text-purple-300 uppercase flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>ACTIVE LYRIC WORD BANK</span>
            </h3>
            <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-0.5 font-mono text-xs font-bold text-purple-300">
              {words.length} {words.length === 1 ? 'word' : 'unique words'}
            </span>
          </div>

          {/* Controls: Reload presets + CLEAR THE WORD BANK */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadAllPresets}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition underline underline-offset-4"
              title="Reload default 125+ lyric dictionary"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reload default dictionary</span>
            </button>

            {words.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/15 px-3.5 py-1.5 text-xs font-bold text-red-300 shadow-sm transition hover:bg-red-500/30 hover:border-red-500/60 active:scale-95"
                title="Hapus semua kata dari Word Bank"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                <span>CLEAR THE WORD BANK</span>
              </button>
            )}
          </div>
        </div>

        {/* Word Tag Cloud */}
        {words.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#070712]/50 py-10 text-center text-sm text-zinc-400">
            <p className="font-semibold text-zinc-300 mb-2">Word Bank kamu saat ini kosong (Empty Word Bank).</p>
            <p className="text-xs text-zinc-500 mb-4">
              Ketik kata di atas, gunakan <span className="text-purple-400 font-bold">Add Bulk Words</span>, atau muat ulang dictionary bawaan.
            </p>
            <button
              onClick={handleLoadAllPresets}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600/30 border border-purple-500/40 px-4 py-2 text-xs font-bold text-purple-200 transition hover:bg-purple-600/50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reload Default Lyric Dictionary</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1 pr-2">
            {words.map((word, idx) => (
              <span
                key={`${word}-${idx}`}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#121226] px-3.5 py-1.5 font-mono text-xs font-medium text-zinc-200 transition hover:border-purple-500/40 hover:bg-[#191933]"
              >
                <span>{word}</span>
                <button
                  onClick={() => handleRemoveWord(idx)}
                  className="rounded-full p-0.5 text-zinc-400 hover:bg-red-500/30 hover:text-red-300 transition"
                  title={`Remove "${word}"`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Generator Controls & Output */}
      <div className="glass-card relative overflow-hidden rounded-2xl border border-amber-500/30 bg-[#0f0c22] p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Dices className="h-5 w-5 text-amber-400 animate-pulse" />
            <h3 className="text-sm font-black tracking-widest text-zinc-100 uppercase">
              GENERATE RANDOM LYRIC WORDS
            </h3>
          </div>

          {/* Number of words selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-zinc-300">Number of words to generate:</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#070712] px-3 py-1.5">
              <button
                onClick={() => setWordCount((prev) => Math.max(1, prev - 1))}
                className="h-6 w-6 rounded-md bg-white/10 text-xs font-extrabold text-white transition hover:bg-white/20"
              >
                -
              </button>
              <span className="font-mono text-sm font-bold text-amber-300 min-w-[20px] text-center">
                {wordCount}
              </span>
              <button
                onClick={() => setWordCount((prev) => Math.min(Math.max(1, words.length), prev + 1))}
                className="h-6 w-6 rounded-md bg-white/10 text-xs font-extrabold text-white transition hover:bg-white/20"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <button
          onClick={handleGenerateRandom}
          disabled={words.length === 0}
          className="group relative w-full inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 px-6 py-4 text-base font-black tracking-wider text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-amber-500/35 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Dices className="h-5 w-5 transition-transform group-hover:rotate-180 duration-500" />
          <span>GENERATE {wordCount} RANDOM LYRIC {wordCount === 1 ? 'WORD' : 'WORDS'}</span>
        </button>

        {/* Generated Output Display */}
        {generatedResult.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-[#070714] p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold tracking-wider uppercase">
              <span>GENERATED LYRIC INSPIRATION (UNIQUE):</span>
              <span className="font-mono text-zinc-400">{generatedResult.length} unique words</span>
            </div>

            {/* Generated Words Display Chips */}
            <div className="flex flex-wrap gap-2 rounded-lg bg-[#0f0f24] p-4 border border-white/5">
              {generatedResult.map((w, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1 font-mono text-sm font-bold text-amber-200"
                >
                  {w}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied Lyric Words!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Lyric Words</span>
                  </>
                )}
              </button>

              {onAppendToMainPrompt && (
                <button
                  onClick={handleAppendToMain}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow transition hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98]"
                >
                  {appended ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>Appended to Style Prompt!</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Append to Main Style Prompt</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
