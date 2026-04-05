'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { curriculum, Phrase } from '@/data/curriculum';
import PhraseCard from '@/components/PhraseCard';

interface SearchResult {
  phrase: Phrase;
  unitId: number;
  unitTitle: string;
  unitEmoji: string;
}

const allPhrases: SearchResult[] = curriculum.flatMap(unit =>
  unit.phrases.map(phrase => ({
    phrase,
    unitId: unit.id,
    unitTitle: unit.titleKo,
    unitEmoji: unit.emoji,
  }))
);

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const results = q.length === 0 ? [] : allPhrases.filter(({ phrase }) =>
    phrase.japanese.toLowerCase().includes(q) ||
    phrase.korean.toLowerCase().includes(q) ||
    phrase.romaji.toLowerCase().includes(q)
  );

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col">
      <div className="bg-indigo-600 text-white px-4 pt-10 pb-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="text-indigo-200 text-sm mb-3 flex items-center gap-1 active:opacity-70">
            ← 뒤로
          </button>
          <div className="text-xl font-bold mb-3">🔍 표현 검색</div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="한국어, 일본어, 로마자로 검색..."
            autoFocus
            className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {q.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-16">
            <div className="text-4xl mb-3">🔍</div>
            전체 {allPhrases.length}개 표현을 검색할 수 있어요
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-16">
            <div className="text-4xl mb-3">🤔</div>
            <div>&quot;{query}&quot;에 해당하는 표현이 없어요</div>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-400 mb-3">{results.length}개 결과</div>
            <div className="space-y-3">
              {results.map((item, i) => (
                <div key={`${item.unitId}-${item.phrase.japanese}`}>
                  {(i === 0 || results[i - 1].unitId !== item.unitId) && (
                    <div className="text-xs font-semibold text-gray-400 mb-1.5 px-1 mt-3 first:mt-0">
                      {item.unitEmoji} Unit {item.unitId} · {item.unitTitle}
                    </div>
                  )}
                  <PhraseCard phrase={item.phrase} index={i} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
