import React from 'react';
import { Music, Undo2, Sparkles, Copy, Check } from 'lucide-react';
import { MAX_PROMPT_LENGTH } from '../utils/promptGenerator';

interface PromptConsoleProps {
  promptText: string;
  onChangePrompt: (newPrompt: string) => void;
  onElaborate: () => void;
  onUndo: () => void;
  onCopy: () => void;
  canUndo: boolean;
  copied: boolean;
}

export const PromptConsole: React.FC<PromptConsoleProps> = ({
  promptText,
  onChangePrompt,
  onElaborate,
  onUndo,
  onCopy,
  canUndo,
  copied,
}) => {
  const charCount = promptText.length;
  const isNearLimit = charCount >= MAX_PROMPT_LENGTH - 50;

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl border border-purple-500/20 bg-[#0e0c1d] p-5 shadow-2xl">
      {/* Top Console Header */}
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-black tracking-widest text-zinc-100 uppercase">
            YOUR STYLE PROMPT
          </h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
              isNearLimit
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/10 text-zinc-400'
            }`}
          >
            {charCount} / {MAX_PROMPT_LENGTH}
          </span>
        </div>

        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Step back through your changes"
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:bg-white/15 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Undo2 className="h-3.5 w-3.5" />
          <span>Undo</span>
        </button>
      </div>

      {/* Main Textarea Prompt Input */}
      <div className="relative mb-4">
        <textarea
          value={promptText}
          onChange={(e) => onChangePrompt(e.target.value)}
          maxLength={MAX_PROMPT_LENGTH}
          rows={4}
          spellCheck={false}
          className="w-full resize-none rounded-xl border border-white/10 bg-[#070712]/90 p-4 font-mono text-sm leading-relaxed text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/50"
          placeholder="Craft or paste your prompt here..."
        />
      </div>

      {/* Buttons Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Elaborate Button */}
        <button
          onClick={onElaborate}
          className="group relative flex-1 inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/70 via-indigo-950/80 to-purple-950/70 px-6 py-3.5 shadow-lg transition-all duration-300 hover:border-cyan-400/60 hover:scale-[1.01] active:scale-[0.99]"
        >
          {/* Subtle sparkling glow background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-indigo-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          <Sparkles className="h-5 w-5 text-amber-300 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <span className="text-base font-black tracking-widest text-white uppercase">
            ELABORATE
          </span>
          <Sparkles className="h-5 w-5 text-cyan-300 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />

          {/* Badge */}
          <span className="ml-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
            +~500 chars of detail
          </span>
        </button>

        {/* Copy Prompt Button */}
        <button
          onClick={onCopy}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-extrabold text-white shadow-lg transition-all duration-300 active:scale-[0.99] ${
            copied
              ? 'bg-emerald-600 shadow-emerald-500/25'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01]'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-5 w-5 text-white animate-bounce" />
              <span>Copied to clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-5 w-5" />
              <span>Copy prompt</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Guidance Note */}
      <p className="mt-3 text-center text-xs leading-relaxed text-zinc-400">
        The prompt above is fully editable — overwrite anything, use{' '}
        <span className="font-semibold text-zinc-200">Undo</span> to step back through your changes, then paste it into your generator's{' '}
        <span className="font-semibold text-zinc-200">Style of Music</span> box.
      </p>
    </div>
  );
};
