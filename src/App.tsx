import { useState, useCallback, useMemo } from 'react';
import { Header, TabType } from './components/Header';
import { IngredientCard } from './components/IngredientCard';
import { PromptConsole } from './components/PromptConsole';
import { WordBankTab } from './components/WordBankTab';
import { Toast } from './components/Toast';
import {
  IngredientState,
  CategoryKey,
  CATEGORY_MAP,
} from './data/dropdownData';
import {
  getInitialIngredients,
  buildPrompt,
  shuffleIngredients,
  randomizeCategory,
  elaboratePrompt,
} from './utils/promptGenerator';

export function App() {
  // Tab state: 'ingredients' | 'words'
  const [activeTab, setActiveTab] = useState<TabType>('ingredients');

  // Ingredient values state
  const [ingredients, setIngredients] = useState<IngredientState>(getInitialIngredients());

  // Lock toggles per category card
  const [locked, setLocked] = useState<Record<CategoryKey, boolean>>({
    genre: false,
    mood: false,
    theme: false,
    vocal: false,
    instrument: false,
    production: false,
    tempo: false,
    era: false,
    keySig: false,
  });

  // Current prompt text state
  const [promptText, setPromptText] = useState<string>(() => {
    return buildPrompt(getInitialIngredients()).stylePrompt;
  });

  // Undo history stack
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // Count locked cards
  const lockedCount = useMemo(() => {
    return Object.values(locked).filter(Boolean).length;
  }, [locked]);

  // Push current prompt to history stack before mutating
  const pushHistory = useCallback((prevText: string) => {
    setHistory((prev) => [...prev, prevText]);
  }, []);

  // Update prompt text manually or programmatically
  const updatePromptText = useCallback(
    (newText: string, saveToHistory: boolean = true) => {
      if (saveToHistory && newText !== promptText) {
        pushHistory(promptText);
      }
      setPromptText(newText);
    },
    [promptText, pushHistory]
  );

  // Append text from Word Bank to main style prompt
  const handleAppendToMainPrompt = useCallback(
    (textToAppend: string) => {
      const trimmedText = textToAppend.trim();
      if (!trimmedText) return;
      const combined = promptText ? `${promptText}, ${trimmedText}` : trimmedText;
      updatePromptText(combined);

      setToastMessage('Appended words to Style Prompt!');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2500);
    },
    [promptText, updatePromptText]
  );

  // Handle dropdown select for a category card
  const handleSelectCategory = useCallback(
    (category: CategoryKey, value: string) => {
      setIngredients((prev) => {
        const next = { ...prev, [category]: value };
        const { stylePrompt } = buildPrompt(next);
        updatePromptText(stylePrompt);
        return next;
      });
    },
    [updatePromptText]
  );

  // Handle single card randomizer
  const handleRandomizeCategory = useCallback(
    (category: CategoryKey) => {
      if (locked[category]) return;
      setIngredients((prev) => {
        const next = randomizeCategory(prev, category);
        const { stylePrompt } = buildPrompt(next);
        updatePromptText(stylePrompt);
        return next;
      });
    },
    [locked, updatePromptText]
  );

  // Toggle lock state for a category card
  const handleToggleLock = useCallback((category: CategoryKey) => {
    setLocked((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // Shuffle all unlocked cards at once
  const handleShuffleAll = useCallback(() => {
    setIngredients((prev) => {
      const next = shuffleIngredients(prev, locked);
      const { stylePrompt } = buildPrompt(next);
      updatePromptText(stylePrompt);
      return next;
    });
  }, [locked, updatePromptText]);

  // Handle ELABORATE button
  const handleElaborate = useCallback(() => {
    const elaborated = elaboratePrompt(promptText);
    updatePromptText(elaborated);
    
    // Show quick toast notification
    setToastMessage('Prompt elaborated with extra studio details!');
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, [promptText, updatePromptText]);

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setPromptText(previous);
  }, [history]);

  // Handle Copy prompt to clipboard
  const handleCopy = useCallback(() => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText).then(() => {
      setCopied(true);
      setToastMessage('Prompt copied to clipboard!');
      setToastVisible(true);

      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setToastVisible(false), 3000);
    });
  }, [promptText]);

  // Grid categories ordering matching screenshot layout
  const categoriesOrder: CategoryKey[] = [
    'genre',
    'mood',
    'theme',
    'vocal',
    'instrument',
    'production',
    'tempo',
    'era',
    'keySig',
  ];

  return (
    <div className="min-h-screen bg-[#06060d] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-zinc-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Main Header with Tab Switcher */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onShuffleAll={handleShuffleAll}
          lockedCount={lockedCount}
        />

        {/* Tab Content */}
        {activeTab === 'ingredients' ? (
          <>
            {/* 3x3 Ingredient Cards Grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoriesOrder.map((categoryKey) => {
                const { label, list } = CATEGORY_MAP[categoryKey];
                return (
                  <IngredientCard
                    key={categoryKey}
                    categoryKey={categoryKey}
                    label={label}
                    value={ingredients[categoryKey]}
                    options={list}
                    isLocked={locked[categoryKey]}
                    onSelect={(val) => handleSelectCategory(categoryKey, val)}
                    onRandomize={() => handleRandomizeCategory(categoryKey)}
                    onToggleLock={() => handleToggleLock(categoryKey)}
                  />
                );
              })}
            </div>

            {/* Console Prompt Box */}
            <PromptConsole
              promptText={promptText}
              onChangePrompt={setPromptText}
              onElaborate={handleElaborate}
              onUndo={handleUndo}
              onCopy={handleCopy}
              canUndo={history.length > 0}
              copied={copied}
            />
          </>
        ) : (
          <div className="space-y-8">
            {/* Word Bank Tab View */}
            <WordBankTab onAppendToMainPrompt={handleAppendToMainPrompt} />

            {/* Console Prompt Box (always available for easy access & editing) */}
            <PromptConsole
              promptText={promptText}
              onChangePrompt={setPromptText}
              onElaborate={handleElaborate}
              onUndo={handleUndo}
              onCopy={handleCopy}
              canUndo={history.length > 0}
              copied={copied}
            />
          </div>
        )}

        {/* Notification Toast */}
        <Toast message={toastMessage} visible={toastVisible} />
      </div>
    </div>
  );
}

export default App;
