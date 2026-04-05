'use client';

import { useState, useMemo, useRef } from 'react';
import { Phrase, DialogLine } from '@/data/curriculum';

interface QuizEngineProps {
  phrases: Phrase[];
  dialogLines: DialogLine[];
  onComplete: () => void;
  onWrongAnswers?: (wrongs: Phrase[]) => void;
}

type QuizType = 'ko-to-jp' | 'jp-to-ko' | 'romaji-to-jp' | 'fill-blank';

interface Question {
  type: QuizType;
  prompt: string;
  promptSub?: string;
  answer: string;
  options: string[];
  label: string;
  phraseRef: Phrase;  // 원본 표현 참조 (오답 저장용)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeOptions(correct: string, pool: string[], count = 4): string[] {
  const others = shuffle(pool.filter(p => p !== correct)).slice(0, count - 1);
  return shuffle([correct, ...others]);
}

function buildQuestions(phrases: Phrase[], dialogLines: DialogLine[]): Question[] {
  const questions: Question[] = [];

  // Type A: 한국어 → 일본어
  for (const p of phrases) {
    questions.push({
      type: 'ko-to-jp', label: '한→일',
      prompt: p.korean,
      answer: p.japanese,
      options: makeOptions(p.japanese, phrases.map(x => x.japanese)),
      phraseRef: p,
    });
  }

  // Type B: 일본어 → 한국어
  for (const p of phrases) {
    questions.push({
      type: 'jp-to-ko', label: '일→한',
      prompt: p.japanese, promptSub: p.romaji,
      answer: p.korean,
      options: makeOptions(p.korean, phrases.map(x => x.korean)),
      phraseRef: p,
    });
  }

  // Type C: 로마자 → 일본어
  for (const p of phrases) {
    questions.push({
      type: 'romaji-to-jp', label: '발음→일',
      prompt: p.romaji,
      answer: p.japanese,
      options: makeOptions(p.japanese, phrases.map(x => x.japanese)),
      phraseRef: p,
    });
  }

  // Type D: 대화 빈칸 채우기
  for (const line of dialogLines) {
    const matched = phrases.find(p =>
      line.japanese.includes(p.japanese) && p.japanese.length > 2
    );
    if (!matched) continue;
    const blanked = line.japanese.replace(matched.japanese, '＿＿＿');
    questions.push({
      type: 'fill-blank', label: '빈칸',
      prompt: blanked, promptSub: line.korean,
      answer: matched.japanese,
      options: makeOptions(matched.japanese, phrases.map(x => x.japanese)),
      phraseRef: matched,
    });
  }

  return shuffle(questions);
}

const TYPE_COLOR: Record<QuizType, string> = {
  'ko-to-jp': 'bg-indigo-100 text-indigo-700',
  'jp-to-ko': 'bg-emerald-100 text-emerald-700',
  'romaji-to-jp': 'bg-violet-100 text-violet-700',
  'fill-blank': 'bg-amber-100 text-amber-700',
};

export default function QuizEngine({ phrases, dialogLines, onComplete, onWrongAnswers }: QuizEngineProps) {
  const questions = useMemo(() => buildQuestions(phrases, dialogLines), [phrases, dialogLines]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const wrongPhrases = useRef<Phrase[]>([]);

  const q = questions[index];

  function handleAnswer(opt: string) {
    if (selected) return;
    setSelected(opt);
    const isCorrect = opt === q.answer;
    if (isCorrect) {
      setCorrect(c => c + 1);
    } else {
      // 오답이면 phraseRef 저장 (중복 제거)
      const already = wrongPhrases.current.some(p => p.japanese === q.phraseRef.japanese);
      if (!already) wrongPhrases.current.push(q.phraseRef);
    }

    setTimeout(() => {
      const next = index + 1;
      if (next >= questions.length) {
        setDone(true);
      } else {
        setIndex(next);
        setSelected(null);
      }
    }, 900);
  }

  if (done) {
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="flex flex-col items-center gap-5 py-10">
        <div className="text-6xl">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚'}</div>
        <div className="text-3xl font-bold text-gray-800">{pct}점</div>
        <div className="text-gray-500">{correct} / {total} 정답</div>
        {wrongPhrases.current.length > 0 && (
          <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
            오답 {wrongPhrases.current.length}개가 오답 노트에 저장됩니다
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-sm text-center">
          {(['ko-to-jp', 'jp-to-ko', 'romaji-to-jp', 'fill-blank'] as QuizType[]).map(t => {
            const typeQs = questions.filter(q => q.type === t);
            const typeLabel = typeQs[0]?.label ?? t;
            return (
              <div key={t} className="bg-gray-50 rounded-xl p-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR[t]}`}>{typeLabel}</span>
                <div className="mt-1 font-semibold">{typeQs.length}문제</div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => {
            onWrongAnswers?.(wrongPhrases.current);
            onComplete();
          }}
          className="mt-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-semibold active:scale-95 transition-transform"
        >
          완료
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-300"
            style={{ width: `${(index / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-14 text-right">{index + 1}/{questions.length}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLOR[q.type]}`}>
          {q.label}
        </span>
        <span className="text-xs text-gray-400">
          {{'ko-to-jp': '한국어를 보고 일본어를 고르세요', 'jp-to-ko': '일본어를 보고 한국어를 고르세요', 'romaji-to-jp': '발음을 보고 일본어를 고르세요', 'fill-blank': '빈칸에 알맞은 표현을 고르세요'}[q.type]}
        </span>
      </div>

      <div className="bg-indigo-50 rounded-2xl p-5 text-center min-h-[100px] flex flex-col items-center justify-center gap-1">
        <div className="text-xl font-bold text-gray-800 leading-relaxed">{q.prompt}</div>
        {q.promptSub && <div className="text-sm text-indigo-500">{q.promptSub}</div>}
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {q.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrectAns = opt === q.answer;
          let cls = 'bg-white border-2 border-gray-100 text-gray-700';
          if (selected) {
            if (isCorrectAns) cls = 'bg-green-50 border-2 border-green-400 text-green-700';
            else if (isSelected) cls = 'bg-red-50 border-2 border-red-400 text-red-700';
          }
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={!!selected}
              className={`w-full p-3.5 rounded-2xl text-left transition-all active:scale-[0.98] ${cls}`}
            >
              <div className="font-medium text-sm">{opt}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
