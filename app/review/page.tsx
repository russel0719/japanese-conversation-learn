'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { curriculum, Phrase, DialogLine } from '@/data/curriculum';
import { getProgress } from '@/lib/progress';
import { addWrongAnswers } from '@/lib/wrongAnswers';
import QuizEngine from '@/components/QuizEngine';

export default function ReviewPage() {
  const router = useRouter();
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [dialogLines, setDialogLines] = useState<DialogLine[]>([]);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const progress = getProgress();
    const completedUnits = curriculum.filter(u => progress[u.id]?.learnCompleted);
    const allPhrases: Phrase[] = [];
    const allDialogs: DialogLine[] = [];
    for (const unit of completedUnits) {
      allPhrases.push(...unit.phrases);
      allDialogs.push(...unit.dialogLines);
    }
    setPhrases(allPhrases);
    setDialogLines(allDialogs);
    setReady(true);
  }, []);

  if (!ready) return null;

  if (phrases.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-5xl">📚</div>
        <div className="text-xl font-bold text-gray-800">학습 완료한 Unit이 없어요</div>
        <div className="text-sm text-gray-500 text-center">Unit을 하나 이상 학습 완료하면 랜덤 복습을 시작할 수 있어요.</div>
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
        <div className="bg-indigo-600 text-white px-4 pt-10 pb-4">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => router.back()} className="text-indigo-200 text-sm mb-3 flex items-center gap-1 active:opacity-70">
              ← 뒤로
            </button>
            <div className="text-xl font-bold">🔄 랜덤 복습</div>
            <div className="text-indigo-200 text-xs mt-1">학습 완료한 Unit에서 랜덤으로 출제</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="text-5xl">🔄</div>
          <div className="text-xl font-bold text-gray-800">랜덤 복습</div>
          <div className="text-sm text-gray-500 text-center">
            학습 완료한 Unit의 표현 <span className="font-semibold text-indigo-600">{phrases.length}개</span>로 퀴즈를 풀어보세요!
          </div>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-semibold active:scale-95 transition-transform"
          >
            복습 시작
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col">
      <div className="bg-indigo-600 text-white px-4 pt-10 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-xl font-bold">🔄 랜덤 복습</div>
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
