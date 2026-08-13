import {
  IngredientState,
  CategoryKey,
  CATEGORY_MAP,
  EMBELLISHMENTS,
  INSTRUMENTS,
  GENRES,
  MOODS,
  THEMES,
  VOCALS,
  PRODUCTIONS,
  TEMPOS,
  ERAS,
  KEYS
} from '../data/dropdownData';

export const MAX_PROMPT_LENGTH = 1000;
export const ELABORATE_CHAR_TARGET = 500;

// Helper to pick a random item from an array
export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Pick a random item distinct from current
export function getDistinctRandomItem<T>(arr: T[], current: T): T {
  if (arr.length <= 1) return current;
  let next = getRandomItem(arr);
  while (next === current) {
    next = getRandomItem(arr);
  }
  return next;
}

// Truncate text at length boundary smoothly by comma or limit
export function truncatePrompt(prompt: string, maxLen: number = MAX_PROMPT_LENGTH): string {
  if (prompt.length <= maxLen) return prompt;
  const commaIdx = prompt.lastIndexOf(',', maxLen);
  const truncated = commaIdx > 0 ? prompt.slice(0, commaIdx) : prompt.slice(0, maxLen);
  return truncated.trim().replace(/,+$/, '');
}

// Format style prompt from ingredients exactly matching original app logic
export function buildPrompt(ingredients: Omit<IngredientState, 'stylePrompt' | 'concept'>): {
  stylePrompt: string;
  concept: string;
} {
  const parts = [
    ingredients.genre,
    ingredients.era,
    ingredients.mood,
    `in ${ingredients.keySig}`,
    ingredients.vocal,
    ingredients.instrument,
    ingredients.production,
    ingredients.tempo,
    ...ingredients.extras,
  ].filter(Boolean);

  const stylePrompt = truncatePrompt(parts.join(', '), MAX_PROMPT_LENGTH);
  const concept = `A ${ingredients.mood} ${ingredients.genre} track about ${ingredients.theme}, built on ${ingredients.instrument} with ${ingredients.vocal}.`;

  return { stylePrompt, concept };
}

// Generate default initial ingredients matching image screenshot
export function getInitialIngredients(): IngredientState {
  return {
    genre: 'alternative rock',
    mood: 'romantic',
    theme: 'stargazing with someone',
    vocal: 'intimate close-mic vocals',
    instrument: 'vintage music box',
    production: '90s radio production',
    tempo: 'laid-back head-nod, 90 BPM',
    era: '80s synth-driven sound',
    keySig: 'E major',
    extras: []
  };
}

// Shuffle unlocked categories
export function shuffleIngredients(
  current: IngredientState,
  locked: Record<CategoryKey, boolean>
): IngredientState {
  const next: IngredientState = {
    genre: locked.genre ? current.genre : getRandomItem(GENRES),
    mood: locked.mood ? current.mood : getRandomItem(MOODS),
    theme: locked.theme ? current.theme : getRandomItem(THEMES),
    vocal: locked.vocal ? current.vocal : getRandomItem(VOCALS),
    instrument: locked.instrument ? current.instrument : getRandomItem(INSTRUMENTS),
    production: locked.production ? current.production : getRandomItem(PRODUCTIONS),
    tempo: locked.tempo ? current.tempo : getRandomItem(TEMPOS),
    era: locked.era ? current.era : getRandomItem(ERAS),
    keySig: locked.keySig ? current.keySig : getRandomItem(KEYS),
    extras: []
  };
  return next;
}

// Randomize single category
export function randomizeCategory(
  current: IngredientState,
  category: CategoryKey
): IngredientState {
  const list = CATEGORY_MAP[category].list;
  const currentVal = current[category];
  const newVal = getDistinctRandomItem(list, currentVal);
  return {
    ...current,
    [category]: newVal
  };
}

// Elaborate feature logic
export function elaboratePrompt(
  currentText: string,
  targetCharAdd: number = ELABORATE_CHAR_TARGET
): string {
  const trimmed = currentText.trim().replace(/[,\s]+$/, '');
  const startLen = trimmed.length;
  const maxAllowed = Math.min(startLen + targetCharAdd, MAX_PROMPT_LENGTH);
  const lowerText = trimmed.toLowerCase();

  // Filter available embellishments not already present
  const availableEmbellishments = EMBELLISHMENTS.filter(
    (e) => !lowerText.includes(e.toLowerCase())
  );

  // Filter extra instruments not already present
  const availableInstruments = INSTRUMENTS.filter(
    (i) => !lowerText.includes(i.toLowerCase())
  );

  // Shuffle candidate pool
  const candidatePool = [...availableEmbellishments];
  
  // Mix in up to 3 extra instruments
  const instPool = [...availableInstruments];
  for (let i = 0; i < 3 && instPool.length > 0; i++) {
    const idx = Math.floor(Math.random() * instPool.length);
    candidatePool.push(instPool.splice(idx, 1)[0]);
  }

  // Shuffle candidate pool
  for (let i = candidatePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidatePool[i], candidatePool[j]] = [candidatePool[j], candidatePool[i]];
  }

  const addedItems: string[] = [];
  let currentLen = startLen;

  for (const item of candidatePool) {
    const projectedLen = currentLen === 0 ? item.length : currentLen + 2 + item.length;
    if (projectedLen > MAX_PROMPT_LENGTH) break;
    addedItems.push(item);
    currentLen = projectedLen;
    if (currentLen >= maxAllowed) break;
  }

  if (addedItems.length === 0) return trimmed;

  const result = trimmed ? `${trimmed}, ${addedItems.join(', ')}` : addedItems.join(', ');
  return truncatePrompt(result, MAX_PROMPT_LENGTH);
}
