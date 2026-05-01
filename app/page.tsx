'use client';

import { useRouter } from 'next/navigation';
import { curriculum } from '@/data/curriculum';
import { useData } from '@/contexts/DataContext';
import UnitCard from '@/components/UnitCard';
import AuthButton from '@/components/AuthButton';

export default function HomePage() {
  const router = useRouter();
  const { progress, favorites, wrongAnswers } = useData();

  const totalDone = Object.values(progress).filter(p => p.learnCompleted && p.quizCompleted).length;
  const learnDone = Object.values(progress).filter(p => p.learnCompleted).length;
  const wrongCount = Object.keys(wrongAnswers).length;
  const favCount = favorites.length;
  const pct = Math.round((totalDone / curriculum.length) * 100);

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      {/* 헤더 */}
      <div className="bg-indigo-600 text-white px-4 pt-10 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="text-3xl font-bold">🇯🇵 일본어 회화</div>
            <AuthButton />
          </div>
          <div className="text-indigo-200 text-sm mb-4">25개 Unit · 체계적인 커리큘럼</div>
          <div className="bg-indigo-500/40 rounded-2xl p-3 flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs text-indigo-200 mb-1.5">전체 진도</div>
              <div className="h-2.5 bg-indigo-400/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold">{totalDone}<span className="text-sm font-normal text-indigo-200">/{curriculum.length}</span></div>
              <div className="text-xs text-indigo-200">{pct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 기능 버튼 그리드 */}
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-1">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              emoji: '🔄', label: '랜덤 복습', sub: learnDone > 0 ? `${learnDone}개 Unit` : '학습 후 활성화',
              active: learnDone > 0, path: '/review', color: 'bg-indigo-500',
            },
            {
              emoji: '🔍', label: '표현 검색', sub: `전체 ${curriculum.reduce((s, u) => s + u.phrases.length, 0)}개`,
              active: true, path: '/search', color: 'bg-teal-500',
            },
            {
              emoji: '❌', label: '오답 노트', sub: wrongCount > 0 ? `${wrongCount}개` : '오답 없음',
              active: wrongCount > 0, path: '/wrong', color: 'bg-red-500',
            },
            {
              emoji: '⭐', label: '즐겨찾기', sub: favCount > 0 ? `${favCount}개` : '즐겨찾기 없음',
              active: favCount > 0, path: '/favorites', color: 'bg-yellow-500',
            },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => item.active && router.push(item.path)}
              className={`rounded-2xl p-4 text-left transition-all active:scale-95
                ${item.active ? `${item.color} text-white shadow-sm` : 'bg-gray-100 text-gray-400'}`}
            >
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="font-semibold text-sm">{item.label}</div>
              <div className={`text-xs mt-0.5 ${item.active ? 'text-white/70' : 'text-gray-400'}`}>{item.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 커리큘럼 목록 */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-2.5">
        {curriculum.map((unit, idx) => {
          const unitProgress = progress[unit.id] ?? {
            unitId: unit.id,
            learnCompleted: false,
            quizCompleted: false,
            lastVisited: '',
          };
          const prevProgress = idx > 0 ? progress[curriculum[idx - 1].id] : null;
          const locked = idx > 0 && !prevProgress?.learnCompleted;

          return (
            <UnitCard key={unit.id} unit={unit} progress={unitProgress} locked={locked} />
          );
        })}
      </div>

      <div className="h-8" />
    </div>
  );
}
