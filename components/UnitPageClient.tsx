'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { curriculum } from '@/data/curriculum';
import { useData } from '@/contexts/DataContext';
import { getVolume, setVolume } from '@/lib/audioSettings';
import PhraseCard from '@/components/PhraseCard';
import QuizEngine from '@/components/QuizEngine';

type Tab = 'learn' | 'quiz';

const DEFAULT_VOLUME = 0.8;

export default function UnitPageClient({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const unitId = parseInt(id);
  const unit = curriculum.find(u => u.id === unitId);
  const { progress, markLearnCompleted, markQuizCompleted, addWrongAnswers } = useData();

  const [tab, setTab] = useState<Tab>('learn');

  if (!unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Unit를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const unitProgress = progress[unitId] ?? {
    unitId,
    learnCompleted: false,
    quizCompleted: false,
    lastVisited: '',
  };

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'learn', label: '학습', emoji: '📖' },
    { key: 'quiz', label: '퀴즈', emoji: '✏️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex flex-col">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white px-4 pt-10 pb-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-blue-200 text-sm mb-3 flex items-center gap-1 active:opacity-70 min-h-[44px]"
          >
            ← 목록으로
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{unit.emoji}</span>
            <div>
              <div className="text-xs text-blue-200">Unit {unit.id}</div>
              <div className="text-xl font-semibold">{unit.titleKo}</div>
            </div>
          </div>
          <p className="text-blue-200 text-xs mt-2">{unit.description}</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white dark:bg-[#0b0b0c] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 min-h-[44px]
                ${tab === t.key ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-400 dark:text-gray-600'}`}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
              {((t.key === 'learn' && unitProgress.learnCompleted) ||
                (t.key === 'quiz' && unitProgress.quizCompleted)) && (
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {tab === 'learn' && (
          <LearnTab
            unit={unit}
            completed={unitProgress.learnCompleted}
            onComplete={() => markLearnCompleted(unitId)}
          />
        )}
        {tab === 'quiz' && (
          <QuizTab
            unit={unit}
            completed={unitProgress.quizCompleted}
            onComplete={() => markQuizCompleted(unitId)}
            onWrongAnswers={(wrongs) => addWrongAnswers(wrongs, unitId)}
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
  const [volume, setVolumeState] = useState(() => {
    if (typeof window !== 'undefined') return getVolume();
    return DEFAULT_VOLUME;
  });

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolumeState(v);
    setVolume(v);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          핵심 표현 {unit.phrases.length}개를 배워봅시다.
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1.5 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {unit.phrases.map((phrase, i) => (
        <PhraseCard key={i} phrase={phrase} index={i} />
      ))}

      {/* 예시 대화 */}
      <div className="mt-6">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">💬 예시 대화</div>
        <div className="bg-white dark:bg-[#0b0b0c] rounded-xl p-4 space-y-4 border border-gray-200 dark:border-gray-800">
          {unit.dialogLines.map((line, i) => (
            <div key={i} className={`flex gap-2 ${line.speaker === 'B' ? 'justify-end' : ''}`}>
              {line.speaker === 'A' && (
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">A</div>
              )}
              <div className={`max-w-[80%] ${line.speaker === 'B' ? 'text-right' : ''}`}>
                <div className={`rounded-xl px-3 py-2 text-sm inline-block
                  ${line.speaker === 'A'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                    : 'bg-blue-600 text-white rounded-tr-sm'}`}>
                  {line.japanese}
                </div>
                <div className="text-xs text-blue-400 mt-0.5 px-1">{line.romaji}</div>
                <div className="text-xs text-gray-400 dark:text-gray-600 px-1">{line.korean}</div>
              </div>
              {line.speaker === 'B' && (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">B</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {!completed ? (
        <button
          onClick={onComplete}
          className="w-full mt-4 py-3 bg-blue-600 text-white rounded-full font-semibold active:scale-[0.98] transition-transform min-h-[44px]"
        >
          학습 완료 ✓
        </button>
      ) : (
        <div className="w-full mt-4 py-3 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full font-semibold text-center border border-green-200 dark:border-green-900">
          ✓ 학습 완료!
        </div>
      )}
    </div>
  );
}

function QuizTab({ unit, completed, onComplete, onWrongAnswers }: {
  unit: typeof curriculum[0];
  completed: boolean;
  onComplete: () => void;
  onWrongAnswers: (phrases: typeof unit.phrases) => void;
}) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="text-5xl">✏️</div>
        {completed && (
          <div className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950 px-4 py-2 rounded-full border border-green-200 dark:border-green-900">
            ✓ 이미 완료했어요!
          </div>
        )}
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
          4가지 유형으로 배운 표현을 테스트해봐요!<br />
          <span className="text-xs text-gray-400 mt-1 block">
            한→발음 · 발음→한 · 듣기→한 · 빈칸채우기
          </span>
        </p>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold active:scale-95 transition-transform min-h-[44px]"
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
      onWrongAnswers={(wrongs) => onWrongAnswers(wrongs)}
    />
  );
}
