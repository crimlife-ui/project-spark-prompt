import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Dices, Copy, Check, Sparkles, X, ArrowUpRight, BookOpen, Layers, AlertCircle } from 'lucide-react';

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
  // Find original casing if any
  const found = Object.values(LYRIC_PRESETS).flatMap((cat) => cat.words).find((orig) => orig.toLowerCase() === w);
  return found || w;
});

export const WordBankTab: React.FC<WordBankTabProps> = ({ onAppendToMainPrompt }) => {
  // Words list state initialized with full lyric dictionary
  const [words, setWords] = useState<string[]>(ALL_INITIAL_WORDS);
  const [newWordInput, setNewWordInput] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(4);
  const [generatedResult, setGeneratedResult] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [appended, setAppended] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Duplicate detection notification state
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Helper to check if a word exists (case-insensitive)
  const isDuplicate = useCallback((wordToCheck: string, currentList: string[]): boolean => {
    const target = wordToCheck.trim().toLowerCase();
    return currentList.some((w) => w.trim().toLowerCase() === target);
  }, []);

  // Add word handler with duplicate detection
  const handleAddWord = useCallback(() => {
    const trimmed = newWordInput.trim();
    if (!trimmed) return;

    // Check duplicate
    if (isDuplicate(trimmed, words)) {
      setDuplicateWarning(`Kata "${trimmed}" sudah ada di dalam Word Bank!`);
      setTimeout(() => setDuplicateWarning(null), 3000);
      return;
    }

    setDuplicateWarning(null);
    setWords((prev) => [trimmed, ...prev]);
    setNewWordInput('');
  }, [newWordInput, words, isDuplicate]);

  // Load a specific category preset into the bank with deduplication
  const handleLoadPresetCategory = useCallback((catKey: string) => {
    const catWords = LYRIC_PRESETS[catKey]?.words || [];
    setWords((prev) => {
      const existingMap = new Set(prev.map((w) => w.toLowerCase()));
      const uniqueNew = catWords.filter((w) => !existingMap.has(w.toLowerCase()));
      if (uniqueNew.length === 0) {
        setDuplicateWarning(`Semua kata dari kategori ${LYRIC_PRESETS[catKey]?.name} sudah ada di Word Bank!`);
        setTimeout(() => setDuplicateWarning(null), 3000);
      }
      return [...uniqueNew, ...prev];
    });
    setActiveCategoryFilter(catKey);
  }, []);

  // Load all presets deduplicated
  const handleLoadAllPresets = useCallback(() => {
    setWords(ALL_INITIAL_WORDS);
    setActiveCategoryFilter(null);
    setDuplicateWarning(null);
  }, []);

  // Remove single word handler
  const handleRemoveWord = useCallback((indexToRemove: number) => {
    setWords((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }, []);

  // Clear all words
  const handleClearAll = useCallback(() => {
    setWords([]);
    setGeneratedResult([]);
    setDuplicateWarning(null);
  }, []);

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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider text-white uppercase">
              LYRIC WORD BANK & INSPIRATION
            </h2>
            <p className="text-xs text-zinc-300">
              Curate beautiful, evocative vocabulary for song lyric writing with automatic duplicate detection.
            </p>
          </div>
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
            ✨ All Lyric Words
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

      {/* Duplicate Warning Banner */}
      {duplicateWarning && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-300 backdrop-blur-md animate-bounce">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      {/* 1. Add Word Input Panel */}
      <div className="glass-card relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e0c1d] p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-black tracking-widest text-zinc-100 uppercase">
              ADD CUSTOM LYRIC WORD OR PHRASE
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Auto-deduplicated (no duplicate words allowed)
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newWordInput}
            onChange={(e) => {
              setNewWordInput(e.target.value);
              if (duplicateWarning) setDuplicateWarning(null);
            }}
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
      </div>

      {/* 2. Word Bank Collection */}
      <div className="glass-card relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d1a] p-5 shadow-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black tracking-widest text-purple-300 uppercase flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>ACTIVE LYRIC WORD BANK</span>
            </h3>
            <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-0.5 font-mono text-xs font-bold text-purple-300">
              {words.length} {words.length === 1 ? 'word' : 'unique words'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadAllPresets}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition underline underline-offset-4"
            >
              Reload default lyric dictionary
            </button>
            {words.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 transition hover:bg-red-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear Bank</span>
              </button>
            )}
          </div>
        </div>

        {/* Word Tag Cloud */}
        {words.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#070712]/50 py-8 text-center text-sm text-zinc-500">
            Your Lyric Word Bank is empty. Type words above or click{' '}
            <button onClick={handleLoadAllPresets} className="text-purple-400 underline font-semibold">
              Reload default lyric dictionary
            </button>{' '}
            to load words.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 pr-2">
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
