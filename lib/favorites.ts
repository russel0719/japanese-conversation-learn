import { Phrase, Unit } from '@/data/curriculum';

const KEY = 'japanese-learn-favorites';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function isFavorite(japanese: string): boolean {
  return getFavorites().includes(japanese);
}

export function toggleFavorite(japanese: string): boolean {
  const favs = getFavorites();
  const idx = favs.indexOf(japanese);
  if (idx === -1) {
    favs.push(japanese);
    localStorage.setItem(KEY, JSON.stringify(favs));
    return true;
  } else {
    favs.splice(idx, 1);
    localStorage.setItem(KEY, JSON.stringify(favs));
    return false;
  }
}

export function getFavoritePhrases(curriculum: Unit[]): { phrase: Phrase; unitId: number; unitTitle: string }[] {
  const favs = new Set(getFavorites());
  const result: { phrase: Phrase; unitId: number; unitTitle: string }[] = [];
  for (const unit of curriculum) {
    for (const phrase of unit.phrases) {
      if (favs.has(phrase.japanese)) {
        result.push({ phrase, unitId: unit.id, unitTitle: unit.titleKo });
      }
    }
  }
  return result;
}

export function getFavoriteCount(): number {
  return getFavorites().length;
}
