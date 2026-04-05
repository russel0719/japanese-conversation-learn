'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { curriculum } from '@/data/curriculum';

import { getUnitProgress, markLearnCompleted, markQuizCompleted, UnitProgress } from '@/lib/progress';
import { addWrongAnswers } from '@/lib/wrongAnswers';
import PhraseCard from '@/components/PhraseCard';
import QuizEngine from '@/components/QuizEngine';

type Tab = 'learn' | 'quiz';

export default function UnitPageClient({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const unitId = parseInt(id);
  const unit = curriculum.find(u => u.id === unitId);

  const [tab, setTab] = useState<Tab>('learn');
  const [progress, setProgress] = useState<UnitProgress | null>(null);

  useEffect(() => {
    setProgress(getUnitProgress(unitId));
  }, [unitId]);

  const refreshProgress = useCallback(() => {
    setProgress(getUnitProgress(unitId));
  }, [unitId]);

  if (!unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Unit를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'learn', label: '학습', emoji: '📖' },
    { key: 'quiz', label: '퀴즈', emoji: '✏️' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col">
      {/* 헤더 */}
      <div className="bg-indigo-600 text-white px-4 pt-10 pb-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-indigo-200 text-sm mb-3 flex items-center gap-1 active:opacity-70"
          >
            ← 목록으로
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{unit.emoji}</span>
            <div>
              <div className="text-xs text-indigo-200">Unit {unit.id}</div>
              <div className="text-xl font-bold">{unit.titleKo}</div>
            </div>
          </div>
          <p className="text-indigo-200 text-xs mt-2">{unit.description}</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5
                ${tab === t.key ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'}`}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
              {progress && (
                ((t.key === 'learn' && progress.learnCompleted) ||
                 (t.key === 'quiz' && progress.quizCompleted))
              ) && <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {tab === 'learn' && (
          <LearnTab
            unit={unit}
            completed={progress?.learnCompleted ?? false}
            onComplete={() => { markLearnCompleted(unitId); refreshProgress(); }}
          />
        )}
        {tab === 'quiz' && (
          <QuizTab
            unit={unit}
            completed={progress?.quizCompleted ?? false}
            onComplete={() => { markQuizCompleted(unitId); refreshProgress(); }}
          />
        )}
      </div>
    </div>
  );
}

function LearnTab({ unit, completed, onComplete }: {
  unit: typeof curriculum[0];
  completed: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-500 mb-4">
        핵심 표현 {unit.phrases.length}개를 배워봅시다. 🔊 버튼으로 발음을 들어보세요.
      </div>

      {unit.phrases.map((phrase, i) => (
        <PhraseCard key={i} phrase={phrase} index={i} />
      ))}

      {/* 예시 대화 */}
      <div className="mt-6">
        <div className="text-sm font-semibold text-gray-700 mb-3">💬 예시 대화</div>
        <div className="bg-white rounded-2xl p-4 space-y-4 border border-gray-100 shadow-sm">
          {unit.dialogLines.map((line, i) => (
            <div key={i} className={`flex gap-2 ${line.speaker === 'B' ? 'justify-end' : ''}`}>
              {line.speaker === 'A' && (
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">A</div>
              )}
              <div className={`max-w-[80%] ${line.speaker === 'B' ? 'text-right' : ''}`}>
                <div className={`rounded-2xl px-3 py-2 text-sm inline-block
                  ${line.speaker === 'A' ? 'bg-gray-100 text-gray-800 rounded-tl-sm' : 'bg-indigo-600 text-white rounded-tr-sm'}`}>
                  {line.japanese}
                </div>
                <div className="text-xs text-indigo-400 mt-0.5 px-1">{line.romaji}</div>
                <div className="text-xs text-gray-400 px-1">{line.korean}</div>
              </div>
              {line.speaker === 'B' && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">B</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {!completed ? (
        <button
          onClick={onComplete}
          className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-2xl font-semibold active:scale-[0.98] transition-transform"
        >
          학습 완료 ✓
        </button>
      ) : (
        <div className="w-full mt-4 py-3 bg-green-50 text-green-600 rounded-2xl font-semibold text-center border border-green-200">
          ✓ 학습 완료!
        </div>
      )}
    </div>
  );
}

function QuizTab({ unit, completed, onComplete }: {
  unit: typeof curriculum[0];
  completed: boolean;
  onComplete: () => void;
}) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="text-5xl">✏️</div>
        {completed && (
          <div className="text-sm text-green-600 font-medium bg-green-50 px-4 py-2 rounded-full">
            ✓ 이미 완료했어요!
          </div>
        )}
        <p className="text-gray-500 text-center text-sm">
          4가지 유형으로 배운 표현을 테스트해봐요!<br />
          <span className="text-xs text-gray-400 mt-1 block">
            한→일 · 일→한 · 발음→일 · 빈칸채우기
          </span>
        </p>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-semibold active:scale-95 transition-transform"
        >
          {completed ? '다시 풀기' : '퀴즈 시작'}
        </button>
      </div>
    );
  }

  return (
    <QuizEngine
      phrases={unit.phrases}
      dialogLines={unit.dialogLines}
      onComplete={() => { onComplete(); setStarted(false); }}
      onWrongAnswers={(wrongs) => addWrongAnswers(wrongs, unit.id)}
    />
  );
}
