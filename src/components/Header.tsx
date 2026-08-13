import React from 'react';
import { Shuffle, Sparkles, SlidersHorizontal, BookOpen } from 'lucide-react';

export type TabType = 'ingredients' | 'words';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onShuffleAll: () => void;
  lockedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onShuffleAll,
  lockedCount,
}) => {
  return (
    <header className="mb-6 space-y-4 border-b border-white/5 pb-4">
      {/* Top Title & Main Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest text-zinc-100 uppercase">
              PROJECT SPARK PROMPT
            </h1>
            <p className="text-xs text-zinc-400">
              Craft & elaborate studio-grade prompts for Suno, Udio, and AI music generators
            </p>
          </div>
        </div>

        {/* Tab Navigation Switches */}
        <div className="flex items-center rounded-xl border border-white/10 bg-[#0d0d1a] p-1">
          <button
            onClick={() => onTabChange('ingredients')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'ingredients'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Ingredients</span>
          </button>

          <button
            onClick={() => onTabChange('words')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'words'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Word Bank</span>
          </button>
        </div>

        {/* Shuffle All Button (shown when on ingredients tab) */}
        {activeTab === 'ingredients' && (
          <div className="flex items-center gap-3">
            {lockedCount > 0 && (
              <span className="hidden sm:inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                {lockedCount} {lockedCount === 1 ? 'card' : 'cards'} locked
              </span>
            )}

            <button
              onClick={onShuffleAll}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/40 active:scale-[0.98]"
              title="Randomize all unlocked ingredient cards"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
              <Shuffle className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
              <span>Shuffle all</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
