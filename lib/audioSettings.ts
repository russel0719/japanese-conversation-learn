const KEY = 'audio-volume';
const DEFAULT_VOLUME = 0.8;

export function getVolume(): number {
  if (typeof window === 'undefined') return DEFAULT_VOLUME;
  const v = localStorage.getItem(KEY);
  if (v === null) return DEFAULT_VOLUME;
  const n = parseFloat(v);
  return isNaN(n) ? DEFAULT_VOLUME : n;
}

export function setVolume(v: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, String(v));
}
