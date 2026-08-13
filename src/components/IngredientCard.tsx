import React from 'react';
import { RefreshCw, Lock, Unlock } from 'lucide-react';
import { CategoryKey } from '../data/dropdownData';

interface IngredientCardProps {
  categoryKey: CategoryKey;
  label: string;
  value: string;
  options: string[];
  isLocked: boolean;
  onSelect: (value: string) => void;
  onRandomize: () => void;
  onToggleLock: () => void;
}

// Banners for visual aesthetics per category
const CATEGORY_BANNERS: Record<CategoryKey, { gradient: string; iconSvg: React.ReactNode }> = {
  genre: {
    gradient: 'from-purple-900/60 via-pink-900/40 to-indigo-900/60',
    iconSvg: (
      <svg className="absolute right-2 bottom-1 h-12 w-24 opacity-25 text-purple-400" viewBox="0 0 100 40" fill="none">
        <path d="M0 30 Q25 10 50 25 T100 15" stroke="currentColor" strokeWidth="3" fill="none" />
        <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="70" cy="18" r="12" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  },
  mood: {
    gradient: 'from-blue-900/60 via-purple-900/40 to-indigo-900/60',
    iconSvg: (
      <svg className="absolute right-2 bottom-1 h-12 w-24 opacity-25 text-blue-400" viewBox="0 0 100 40" fill="none">
        <path d="M10 20 Q30 5 50 20 T90 20" stroke="currentColor" strokeWidth="3" fill="none" />
        <path d="M10 30 Q30 15 50 30 T90 30" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  },
  theme: {
    gradient: 'from-indigo-900/60 via-violet-900/40 to-purple-900/60',
    iconSvg: (
      <svg className="absolute right-2 bottom-1 h-12 w-24 opacity-25 text-violet-400" viewBox="0 0 100 40" fill="none">
        <circle cx="30" cy="20" r="10" stroke="currentColor" strokeWidth="2" />
        <circle cx="60" cy="15" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M75 10 L85 25 L65 25 Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  vocal: {
    gradient: 'from-fuchsia-900/60 via-purple-900/40 to-pink-900/60',
    iconSvg: (
      <svg className="absolute right-2 bottom-1 h-12 w-24 opacity-25 text-fuchsia-400" viewBox="0 0 100 40" fill="none">
        <rect x="25" y="8" width="10" height="24" rx="5" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20 C20 28 40 28 40 20" stroke="currentColor" strokeWidth="2" />
        <path d="M30 28 L30 36" stroke="currentColor" strokeWidth="2" />
        <path d="M60 15 L90 15 M60 25 L85 25" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
      </svg>
    )
  },
  instrument: {
    gradient: 'from-cyan-900/60 via-blue-900/40 to-purple-900/60',
    iconSvg: (
      <svg className="absolute right-2 bottom-1 h-12 w-24 opacity-25 text-cyan-400" viewBox="0 0 100 40" fill="none">
        <rect x="15" y="10" width="70" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M25 10 L25 22 M35 10 L35 22 M55 10 L55 22 M65 10 L65 22 M75 10 L75 22" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  },
  production: {
    gradient: 'from-violet-900/60 via-indigo-900/40 to-cyan-900/60',
    iconSvg: (
      <svg className="absolute right-2 bottom-1 h-12 w-24 opacity-25 text-indigo-400" viewBox="0 0 100 40" fill="none">
        <circle cx="30" cy="20" r="14" stroke="currentColor" strokeWidth="2" />
        <circle cx="30" cy="20" r="5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="60" y="10" width="25" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  },
  tempo: {
    gradient: 'from-purple-900/60 via-violet-900/40 to-blue-900/60',
    iconSvg: (
      <svg className="absolute right-2 bottom-1 h-12 w-24 opacity-25 text-purple-400" viewBox="0 0 100 40" fill="none">
        <path d="M10 20 L25 10 L40 30 L55 15 L70 25 L85 10 T100 20" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    )
  },
  era: {
    gradient: 'from-pink-900/60 via-purple-900/40 to-amber-900/60',
    iconSvg: (
      <svg className="absolute right-2 bottom-1 h-12 w-24 opacity-25 text-pink-400" viewBox="0 0 100 40" fill="none">
        <rect x="20" y="12" width="60" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="35" cy="22" r="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="65" cy="22" r="5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  keySig: {
    gradient: 'from-amber-900/60 via-purple-900/40 to-indigo-900/60',
    iconSvg: (
      <svg className="absolute right-2 bottom-1 h-12 w-24 opacity-25 text-amber-400" viewBox="0 0 100 40" fill="none">
        <path d="M20 30 L20 10 L50 20 Z" stroke="currentColor" strokeWidth="2" />
        <path d="M60 10 L60 30 M70 10 L70 30 M55 18 L75 18" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
};

export const IngredientCard: React.FC<IngredientCardProps> = ({
  categoryKey,
  label,
  value,
  options,
  isLocked,
  onSelect,
  onRandomize,
  onToggleLock,
}) => {
  const banner = CATEGORY_BANNERS[categoryKey];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isLocked
          ? 'glass-card-locked bg-[#110e20]'
          : 'glass-card border-white/10 hover:border-purple-500/30'
      }`}
    >
      {/* Banner Graphic Header */}
      <div className={`relative h-16 w-full bg-gradient-to-r ${banner.gradient} p-3 overflow-hidden border-b border-white/5`}>
        {/* Background Overlay Graphic */}
        {banner.iconSvg}

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[11px] font-black tracking-widest text-purple-300/90 uppercase drop-shadow">
            {label}
          </span>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 rounded-lg bg-black/40 p-1 backdrop-blur-md border border-white/10">
            <button
              onClick={onRandomize}
              disabled={isLocked}
              title={isLocked ? 'Unlock to randomize' : `Randomize ${label}`}
              className="rounded-md p-1.5 text-zinc-300 transition hover:bg-white/15 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onToggleLock}
              title={isLocked ? 'Unlock ingredient' : 'Lock ingredient'}
              className={`rounded-md p-1.5 transition ${
                isLocked
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                  : 'text-zinc-400 hover:bg-white/15 hover:text-white'
              }`}
            >
              {isLocked ? (
                <Lock className="h-3.5 w-3.5 text-amber-300" />
              ) : (
                <Unlock className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card Content & Dropdown */}
      <div className="p-3 bg-[#0d0d1a]">
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onSelect(e.target.value)}
            className="custom-select w-full truncate rounded-xl border border-white/10 bg-[#121225] py-2.5 pl-3.5 pr-9 text-sm font-semibold text-zinc-100 outline-none transition hover:border-purple-500/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
