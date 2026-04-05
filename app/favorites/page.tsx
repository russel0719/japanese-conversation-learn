'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { curriculum, DialogLine } from '@/data/curriculum';
import { getFavoritePhrases } from '@/lib/favorites';
import { addWrongAnswers } from '@/lib/wrongAnswers';
import PhraseCard from '@/components/PhraseCard';
import QuizEngine from '@/components/QuizEngine';

export default function FavoritesPage() {
  const router = useRouter();
  const [items, setItems] = useState<ReturnType<typeof getFavoritePhrases>>([]);
  const [mode, setMode] = useState<'list' | 'quiz'>('list');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(getFavoritePhrases(curriculum));
    setReady(true);
  }, []);

  if (!ready) return null;

  const phrases = items.map(i => i.phrase);
  const dialogLines: DialogLine[] = [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-5xl">⭐</div>
        <div className="text-xl font-bold text-gray-800">즐겨찾기가 없어요</div>
        <div className="text-sm text-gray-500 text-center">표현 카드의 ☆ 버튼을 눌러 즐겨찾기에 추가하세요.</div>
        <button
          onClick={() => router.back()}
          className="mt-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-semibold active:scale-95 transition-transform text-sm"
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (mode === 'quiz') {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col">
        <div className="bg-yellow-500 text-white px-4 pt-10 pb-4">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setMode('list')} className="text-yellow-100 text-sm mb-3 flex items-center gap-1 active:opacity-70">
              ← 목록으로
            </button>
            <div className="text-xl font-bold">⭐ 즐겨찾기 퀴즈</div>
          </div>
        </div>
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
          <QuizEngine
            phrases={phrases}
            dialogLines={dialogLines}
            onComplete={() => setMode('list')}
            onWrongAnswers={(wrongs) => addWrongAnswers(wrongs, 0)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col">
      <div className="bg-yellow-500 text-white px-4 pt-10 pb-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="text-yellow-100 text-sm mb-3 flex items-center gap-1 active:opacity-70">
            ← 뒤로
          </button>
          <div className="text-xl font-bold">⭐ 즐겨찾기</div>
          <div className="text-yellow-100 text-xs mt-1">{items.length}개의 표현</div>
        </div>
      </div>
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        <button
          onClick={() => setMode('quiz')}
          className="w-full mb-5 py-3 bg-yellow-500 text-white rounded-2xl font-semibold active:scale-95 transition-transform text-sm"
        >
          ✏️ 퀴즈로 연습하기
        </button>

        {/* Unit별로 그룹핑 */}
        {Array.from(new Set(items.map(i => i.unitId))).map(unitId => {
          const unitItems = items.filter(i => i.unitId === unitId);
          const unitTitle = unitItems[0].unitTitle;
          return (
            <div key={unitId} className="mb-5">
              <div className="text-xs font-semibold text-gray-400 mb-2 px-1">Unit {unitId} · {unitTitle}</div>
              <div className="space-y-2">
                {unitItems.map((item, i) => (
                  <PhraseCard key={item.phrase.japanese} phrase={item.phrase} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
