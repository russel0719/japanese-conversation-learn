'use client';

import Link from 'next/link';
import { Unit } from '@/data/curriculum';
import { UnitProgress } from '@/lib/progress';

interface UnitCardProps {
  unit: Unit;
  progress: UnitProgress;
  locked: boolean;
}

export default function UnitCard({ unit, progress, locked }: UnitCardProps) {
  const steps = [progress.learnCompleted, progress.quizCompleted];
  const completed = steps.filter(Boolean).length;
  const pct = Math.round((completed / 2) * 100);
  const allDone = completed === 2;

  if (locked) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl opacity-50 cursor-not-allowed select-none border border-gray-200 dark:border-gray-800">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
          🔒
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-400">Unit {unit.id}</div>
          <div className="font-bold text-gray-500 dark:text-gray-600">{unit.titleKo}</div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/unit/${unit.id}`}>
      <div className={`flex items-center gap-4 p-4 rounded-xl transition-all active:scale-[0.98] border cursor-pointer
        ${allDone
          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900'
          : 'bg-white dark:bg-[#0b0b0c] border-gray-200 dark:border-gray-800'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
          ${allDone ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-50 dark:bg-blue-950'}`}>
          {unit.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-medium mb-0.5 ${allDone ? 'text-green-500' : 'text-blue-500'}`}>
            Unit {unit.id}
          </div>
          <div className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{unit.titleKo}</div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-400' : 'bg-blue-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-xs flex-shrink-0 ${allDone ? 'text-green-500' : 'text-gray-400'}`}>
              {allDone ? '✓ 완료' : `${completed}/2`}
            </span>
          </div>
        </div>
        <div className="text-gray-300 dark:text-gray-700 text-sm">›</div>
      </div>
    </Link>
  );
}
