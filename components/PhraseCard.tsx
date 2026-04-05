'use client';

import { useState, useEffect } from 'react';
import { Phrase } from '@/data/curriculum';
import { isFavorite, toggleFavorite } from '@/lib/favorites';

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
  utter.onstart = onStart;
  utter.onend = onEnd;
  utter.onerror = onEnd;
  window.speechSynthesis.speak(utter);
}

export default function PhraseCard({ phrase, index }: PhraseCardProps) {
  const [playing, setPlaying] = useState(false);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(phrase.japanese));
  }, [phrase.japanese]);

  function handleFav() {
    const next = toggleFavorite(phrase.japanese);
    setFav(next);
  }

  function playTTS() {
    if (playing) return;
    speakJapanese(
      phrase.japanese,
      () => setPlaying(true),
      () => setPlaying(false)
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-medium text-gray-900">{phrase.japanese}</div>
        <div className="text-xs text-indigo-500 mt-0.5">{phrase.romaji}</div>
        <div className="text-sm text-gray-500 mt-0.5">{phrase.korean}</div>
      </div>
      <button
        onClick={handleFav}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95
          ${fav ? 'bg-yellow-50 text-yellow-400' : 'bg-gray-50 text-gray-300 hover:text-yellow-300'}`}
        title="즐겨찾기"
      >
        {fav ? '★' : '☆'}
      </button>
      <button
        onClick={playTTS}
        disabled={playing}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all
          ${playing
            ? 'bg-indigo-100 text-indigo-400 animate-pulse'
            : 'bg-indigo-50 text-indigo-600 active:scale-95 hover:bg-indigo-100'
          }`}
        title="발음 듣기"
      >
        {playing ? '▶' : '🔊'}
      </button>
    </div>
  );
}
