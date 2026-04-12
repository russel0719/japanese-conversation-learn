'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Phrase, DialogLine } from '@/data/curriculum';
import { getVolume } from '@/lib/audioSettings';

interface QuizEngineProps {
  phrases: Phrase[];
  dialogLines: DialogLine[];
  onComplete: () => void;
  onWrongAnswers?: (wrongs: Phrase[]) => void;
}

type QuizType = 'ko-to-romaji' | 'romaji-to-ko' | 'audio-to-ko' | 'fill-blank-romaji';

interface Question {
  type: QuizType;
  prompt: string;
  promptSub?: string;
  answer: string;
  options: string[];
  label: string;
  phraseRef: Phrase;
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

function speakText(text: string, volume: number, onStart: () => void, onEnd: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.85;
  utter.volume = volume;
  utter.onstart = onStart;
  utter.onend = onEnd;
  utter.onerror = onEnd;
  window.speechSynthesis.speak(utter);
}

function buildQuestions(phrases: Phrase[], dialogLines: DialogLine[]): Question[] {
  const questions: Question[] = [];

  // Type 1: 한국어 → 발음(romaji)
  for (const p of phrases) {
    questions.push({
      type: 'ko-to-romaji', label: '한→발음',
      prompt: p.korean,
      answer: p.romaji,
      options: makeOptions(p.romaji, phrases.map(x => x.romaji)),
      phraseRef: p,
    });
  }

  // Type 2: 발음(romaji) → 한국어
  for (const p of phrases) {
    questions.push({
      type: 'romaji-to-ko', label: '발음→한',
      prompt: p.romaji,
      answer: p.korean,
      options: makeOptions(p.korean, phrases.map(x => x.korean)),
      phraseRef: p,
    });
  }

  // Type 3: 음성 듣고 → 한국어 (prompt에 일본어 저장, TTS 재생용)
  for (const p of phrases) {
    questions.push({
      type: 'audio-to-ko', label: '듣기→한',
      prompt: p.japanese,
      answer: p.korean,
      options: makeOptions(p.korean, phrases.map(x => x.korean)),
      phraseRef: p,
    });
  }

  // Type 5: 대화 romaji 빈칸 채우기
  for (const line of dialogLines) {
    const matched = phrases.find(p =>
      line.romaji.toLowerCase().includes(p.romaji.toLowerCase()) && p.romaji.length > 3
    );
    if (!matched) continue;
    const escaped = matched.romaji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blanked = line.romaji.replace(new RegExp(escaped, 'i'), '＿＿＿');
    questions.push({
      type: 'fill-blank-romaji', label: '빈칸',
      prompt: blanked, promptSub: line.korean,
      answer: matched.romaji,
      options: makeOptions(matched.romaji, phrases.map(x => x.romaji)),
      phraseRef: matched,
    });
  }

  return shuffle(questions);
}

const TYPE_COLOR: Record<QuizType, string> = {
  'ko-to-romaji': 'bg-indigo-100 text-indigo-700',
  'romaji-to-ko': 'bg-emerald-100 text-emerald-700',
  'audio-to-ko': 'bg-violet-100 text-violet-700',
  'fill-blank-romaji': 'bg-amber-100 text-amber-700',
};

const TYPE_DESC: Record<QuizType, string> = {
  'ko-to-romaji': '한국어를 보고 발음을 고르세요',
  'romaji-to-ko': '발음을 보고 한국어 뜻을 고르세요',
  'audio-to-ko': '발음을 듣고 한국어 뜻을 고르세요',
  'fill-blank-romaji': '빈칸에 알맞은 발음을 고르세요',
};

export default function QuizEngine({ phrases, dialogLines, onComplete, onWrongAnswers }: QuizEngineProps) {
  const questions = useMemo(() => buildQuestions(phrases, dialogLines), [phrases, dialogLines]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const wrongPhrases = useRef<Phrase[]>([]);

  const q = questions[index];

  // audio-to-ko 문제 진입 시 자동 재생
  useEffect(() => {
    if (q?.type === 'audio-to-ko') {
      const timer = setTimeout(() => {
        speakText(q.prompt, getVolume(), () => setAudioPlaying(true), () => setAudioPlaying(false));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [index]);  // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswer(opt: string) {
    if (selected) return;
    setSelected(opt);
    const isCorrect = opt === q.answer;
    if (isCorrect) {
      setCorrect(c => c + 1);
    } else {
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
          {(['ko-to-romaji', 'romaji-to-ko', 'audio-to-ko', 'fill-blank-romaji'] as QuizType[]).map(t => {
            const typeQs = questions.filter(q => q.type === t);
            if (typeQs.length === 0) return null;
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
        <span className="text-xs text-gray-400">{TYPE_DESC[q.type]}</span>
      </div>

      <div className="bg-indigo-50 rounded-2xl p-5 text-center min-h-[100px] flex flex-col items-center justify-center gap-3">
        {q.type === 'audio-to-ko' ? (
          <>
            <button
              onClick={() => speakText(q.prompt, getVolume(), () => setAudioPlaying(true), () => setAudioPlaying(false))}
              disabled={audioPlaying}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all
                ${audioPlaying
                  ? 'bg-indigo-200 text-indigo-400 animate-pulse'
                  : 'bg-indigo-200 text-indigo-700 active:scale-95 hover:bg-indigo-300'
                }`}
            >
              {audioPlaying ? '▶' : '🔊'}
            </button>
            <div className="text-xs text-indigo-400">버튼을 눌러 다시 들어보세요</div>
          </>
        ) : (
          <>
            <div className="text-xl font-bold text-gray-800 leading-relaxed">{q.prompt}</div>
            {q.promptSub && <div className="text-sm text-indigo-500">{q.promptSub}</div>}
          </>
        )}
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
