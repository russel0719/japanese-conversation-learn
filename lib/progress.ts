export interface UnitProgress {
  unitId: number;
  learnCompleted: boolean;
  quizCompleted: boolean;
  lastVisited: string;
}

const STORAGE_KEY = 'japanese-learn-progress';

export function getProgress(): Record<number, UnitProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getUnitProgress(unitId: number): UnitProgress {
  const all = getProgress();
  return all[unitId] ?? {
    unitId,
    learnCompleted: false,
    quizCompleted: false,
    lastVisited: '',
  };
}

export function updateUnitProgress(unitId: number, update: Partial<UnitProgress>) {
  const all = getProgress();
  const current = getUnitProgress(unitId);
  const updated = { ...current, ...update, lastVisited: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...all, [unitId]: updated }));
  return updated;
}

export function markLearnCompleted(unitId: number) {
  return updateUnitProgress(unitId, { learnCompleted: true });
}

export function markQuizCompleted(unitId: number) {
  return updateUnitProgress(unitId, { quizCompleted: true });
}
