import { Phrase } from '@/data/curriculum';

export interface WrongAnswer {
  phrase: Phrase;
  unitId: number;
  count: number;
  lastWrong: string;
}

const KEY = 'japanese-learn-wrong';

export function getWrongAnswers(): Record<string, WrongAnswer> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function addWrongAnswers(phrases: Phrase[], unitId: number) {
  const all = getWrongAnswers();
  const now = new Date().toISOString();
  for (const phrase of phrases) {
    const existing = all[phrase.japanese];
    all[phrase.japanese] = {
      phrase,
      unitId,
      count: (existing?.count ?? 0) + 1,
      lastWrong: now,
    };
  }
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function removeWrongAnswer(japanese: string) {
  const all = getWrongAnswers();
  delete all[japanese];
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearWrongAnswers() {
  localStorage.removeItem(KEY);
}

export function getWrongCount(): number {
  return Object.keys(getWrongAnswers()).length;
}
