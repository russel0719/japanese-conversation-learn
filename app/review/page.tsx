'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { curriculum, Phrase, DialogLine } from '@/data/curriculum';
import { useData } from '@/contexts/DataContext';
import QuizEngine from '@/components/QuizEngine';

export default function ReviewPage() {
  const router = useRouter();
  const { progress, addWrongAnswers } = useData();
  const [started, setStarted] = useState(false);

  const { phrases, dialogLines } = useMemo(() => {
    const completedUnits = curriculum.filter(u => progress[u.id]?.learnCompleted);
    const allPhrases: Phrase[] = [];
    const allDialogs: DialogLine[] = [];
    for (const unit of completedUnits) {
      allPhrases.push(...unit.phrases);
      allDialogs.push(...unit.dialogLines);
    }
    return { phrases: allPhrases, dialogLines: allDialogs };
  }, [progress]);

  if (phrases.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-5xl">📚</div>
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-100">학습 완료한 Unit이 없어요</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">Unit을 하나 이상 학습 완료하면 랜덤 복습을 시작할 수 있어요.</div>
        <button
          onClick={() => router.back()}
          className="mt-2 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold active:scale-95 transition-transform text-sm min-h-[44px]"
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex flex-col">
        <div className="bg-blue-600 text-white px-4 pt-10 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-xl font-semibold">🔄 랜덤 복습</div>
            <div className="text-blue-200 text-xs mt-1">학습 완료한 Unit에서 랜덤으로 출제</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="text-5xl">🔄</div>
          <div className="text-xl font-semibold text-gray-800 dark:text-gray-100">랜덤 복습</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            학습 완료한 Unit의 표현 <span className="font-semibold text-blue-600 dark:text-blue-400">{phrases.length}개</span>로 퀴즈를 풀어보세요!
          </div>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold active:scale-95 transition-transform min-h-[44px]"
          >
            복습 시작
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex flex-col">
      <div className="bg-blue-600 text-white px-4 pt-10 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-xl font-semibold">🔄 랜덤 복습</div>
        </div>
      </div>
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        <QuizEngine
          phrases={phrases}
          dialogLines={dialogLines}
          onComplete={() => router.push('/')}
          onWrongAnswers={(wrongs) => addWrongAnswers(wrongs, 0)}
        />
      </div>
    </div>
  );
}
