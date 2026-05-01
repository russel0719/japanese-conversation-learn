'use client';

import { useState } from 'react';
import { Phrase } from '@/data/curriculum';
import { useData } from '@/contexts/DataContext';
import { getVolume } from '@/lib/audioSettings';

interface PhraseCardProps {
  phrase: Phrase;
  index: number;
}

function speakJapanese(text: string, onStart: () => void, onEnd: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.85;
  utter.volume = getVolume();
  utter.onstart = onStart;
  utter.onend = onEnd;
  utter.onerror = onEnd;
  window.speechSynthesis.speak(utter);
}

export default function PhraseCard({ phrase, index }: PhraseCardProps) {
  const { favorites, toggleFavorite } = useData();
  const [playing, setPlaying] = useState(false);

  const fav = favorites.includes(phrase.japanese);

  function playTTS() {
    if (playing) return;
    speakJapanese(
      phrase.japanese,
      () => setPlaying(true),
      () => setPlaying(false)
    );
  }

  return (
    <div className="bg-white dark:bg-[#0b0b0c] rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{phrase.japanese}</div>
        <div className="text-xs text-blue-500 mt-0.5">{phrase.romaji}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{phrase.korean}</div>
      </div>
      <button
        onClick={() => toggleFavorite(phrase.japanese)}
        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95
          ${fav ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-400' : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600'}`}
        title="즐겨찾기"
      >
        {fav ? '★' : '☆'}
      </button>
      <button
        onClick={playTTS}
        disabled={playing}
        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all
          ${playing
            ? 'bg-blue-100 dark:bg-blue-950 text-blue-400 animate-pulse'
            : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 active:scale-95'
          }`}
        title="발음 듣기"
      >
        {playing ? '▶' : '🔊'}
      </button>
    </div>
  );
}
