'use client';

import { useRouter } from 'next/navigation';
import { Phrase, DialogLine } from '@/data/curriculum';
import { useData } from '@/contexts/DataContext';
import { WrongAnswer } from '@/lib/wrongAnswers';
import { useState } from 'react';
import QuizEngine from '@/components/QuizEngine';

export default function WrongPage() {
  const router = useRouter();
  const { wrongAnswers, addWrongAnswers, removeWrongAnswer } = useData();
  const [started, setStarted] = useState(false);

  const wrongs: WrongAnswer[] = Object.values(wrongAnswers).sort((a, b) => b.count - a.count);
  const phrases: Phrase[] = wrongs.map(w => w.phrase);
  const dialogLines: DialogLine[] = [];

  if (wrongs.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-5xl">🎉</div>
        <div className="text-xl font-bold text-gray-800">오답이 없어요!</div>
        <div className="text-sm text-gray-500 text-center">퀴즈에서 틀린 표현이 여기에 저장됩니다.</div>
        <button
          onClick={() => router.back()}
          className="mt-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-semibold active:scale-95 transition-transform text-sm"
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col">
        <div className="bg-red-500 text-white px-4 pt-10 pb-4">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => router.back()} className="text-red-200 text-sm mb-3 flex items-center gap-1 active:opacity-70">
              ← 뒤로
            </button>
            <div className="text-xl font-bold">❌ 오답 노트</div>
            <div className="text-red-200 text-xs mt-1">틀린 표현을 다시 학습해요</div>
          </div>
        </div>
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
          <div className="text-sm text-gray-500 mb-4">
            오답 <span className="font-semibold text-red-500">{wrongs.length}개</span>가 저장되어 있어요. 많이 틀린 순으로 표시됩니다.
          </div>
          <div className="space-y-2 mb-6">
            {wrongs.slice(0, 10).map((w) => (
              <div key={w.phrase.japanese} className="bg-white rounded-2xl p-3 border border-red-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {w.count}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{w.phrase.japanese}</div>
                  <div className="text-xs text-gray-400">{w.phrase.korean}</div>
                </div>
                <button
                  onClick={() => removeWrongAnswer(w.phrase.japanese)}
                  className="text-xs text-gray-300 hover:text-red-400 active:scale-95 transition-all"
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            ))}
            {wrongs.length > 10 && (
              <div className="text-xs text-gray-400 text-center py-1">외 {wrongs.length - 10}개</div>
            )}
          </div>
          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 bg-red-500 text-white rounded-2xl font-semibold active:scale-95 transition-transform"
          >
            오답 퀴즈 시작
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col">
      <div className="bg-red-500 text-white px-4 pt-10 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-xl font-bold">❌ 오답 퀴즈</div>
        </div>
      </div>
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        <QuizEngine
          phrases={phrases}
          dialogLines={dialogLines}
          onComplete={() => router.push('/')}
          onWrongAnswers={(newWrongs) => {
            const wrongSet = new Set(newWrongs.map(p => p.japanese));
            phrases.forEach(p => {
              if (!wrongSet.has(p.japanese)) removeWrongAnswer(p.japanese);
            });
            if (newWrongs.length > 0) addWrongAnswers(newWrongs, 0);
          }}
        />
      </div>
    </div>
  );
}
