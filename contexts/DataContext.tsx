'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Phrase } from '@/data/curriculum';
import {
  UnitProgress,
  getProgress as getLocalProgress,
  getUnitProgress as getLocalUnitProgress,
  markLearnCompleted as markLocalLearnCompleted,
  markQuizCompleted as markLocalQuizCompleted,
} from '@/lib/progress';
import {
  getFavorites as getLocalFavorites,
  toggleFavorite as toggleLocalFavorite,
} from '@/lib/favorites';
import {
  WrongAnswer,
  getWrongAnswers as getLocalWrongAnswers,
  addWrongAnswers as addLocalWrongAnswers,
  removeWrongAnswer as removeLocalWrongAnswer,
  clearWrongAnswers as clearLocalWrongAnswers,
} from '@/lib/wrongAnswers';

interface DataContextType {
  progress: Record<number, UnitProgress>;
  favorites: string[];
  wrongAnswers: Record<string, WrongAnswer>;
  markLearnCompleted: (unitId: number) => void;
  markQuizCompleted: (unitId: number) => void;
  toggleFavorite: (japanese: string) => boolean;
  addWrongAnswers: (phrases: Phrase[], unitId: number) => void;
  removeWrongAnswer: (japanese: string) => void;
  clearWrongAnswers: () => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, supabase } = useAuth();
  const [progress, setProgress] = useState<Record<number, UnitProgress>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<Record<string, WrongAnswer>>({});
  const prevUserIdRef = useRef<string | null>(null);

  const loadFromSupabase = useCallback(async (userId: string) => {
    const [progressRes, favRes, wrongRes] = await Promise.all([
      supabase.from('user_progress').select('*').eq('user_id', userId),
      supabase.from('user_favorites').select('japanese').eq('user_id', userId),
      supabase.from('user_wrong_answers').select('*').eq('user_id', userId),
    ]);

    // progress
    if (progressRes.data) {
      const dbProgress: Record<number, UnitProgress> = {};
      for (const row of progressRes.data) {
        dbProgress[row.unit_id] = {
          unitId: row.unit_id,
          learnCompleted: row.learn_completed,
          quizCompleted: row.quiz_completed,
          lastVisited: row.last_visited ?? '',
        };
      }
      localStorage.setItem('japanese-learn-progress', JSON.stringify(dbProgress));
      setProgress(dbProgress);
    }

    // favorites
    if (favRes.data) {
      const favList = favRes.data.map((r) => r.japanese as string);
      localStorage.setItem('japanese-learn-favorites', JSON.stringify(favList));
      setFavorites(favList);
    }

    // wrong answers
    if (wrongRes.data) {
      const wrongMap: Record<string, WrongAnswer> = {};
      for (const row of wrongRes.data) {
        wrongMap[row.japanese] = {
          phrase: row.phrase as Phrase,
          unitId: row.unit_id,
          count: row.count,
          lastWrong: row.last_wrong,
        };
      }
      localStorage.setItem('japanese-learn-wrong', JSON.stringify(wrongMap));
      setWrongAnswers(wrongMap);
    }
  }, [supabase]);

  const loadFromLocal = useCallback(() => {
    setProgress(getLocalProgress());
    setFavorites(getLocalFavorites());
    setWrongAnswers(getLocalWrongAnswers());
  }, []);

  useEffect(() => {
    if (user) {
      if (prevUserIdRef.current !== user.id) {
        prevUserIdRef.current = user.id;
        loadFromSupabase(user.id);
      }
    } else {
      prevUserIdRef.current = null;
      loadFromLocal();
    }
  }, [user, loadFromSupabase, loadFromLocal]);

  const refreshData = useCallback(() => {
    if (user) {
      loadFromSupabase(user.id);
    } else {
      loadFromLocal();
    }
  }, [user, loadFromSupabase, loadFromLocal]);

  const markLearnCompleted = useCallback((unitId: number) => {
    markLocalLearnCompleted(unitId);
    setProgress({ ...getLocalProgress() });
    if (user) {
      const current = getLocalUnitProgress(unitId);
      supabase.from('user_progress').upsert({
        user_id: user.id,
        unit_id: unitId,
        learn_completed: true,
        quiz_completed: current.quizCompleted,
        last_visited: new Date().toISOString(),
      }).then(() => {});
    }
  }, [user, supabase]);

  const markQuizCompleted = useCallback((unitId: number) => {
    markLocalQuizCompleted(unitId);
    setProgress({ ...getLocalProgress() });
    if (user) {
      const current = getLocalUnitProgress(unitId);
      supabase.from('user_progress').upsert({
        user_id: user.id,
        unit_id: unitId,
        learn_completed: current.learnCompleted,
        quiz_completed: true,
        last_visited: new Date().toISOString(),
      }).then(() => {});
    }
  }, [user, supabase]);

  const toggleFavorite = useCallback((japanese: string): boolean => {
    const next = toggleLocalFavorite(japanese);
    const newFavs = getLocalFavorites();
    setFavorites([...newFavs]);
    if (user) {
      if (next) {
        supabase.from('user_favorites').upsert({ user_id: user.id, japanese }).then(() => {});
      } else {
        supabase.from('user_favorites').delete().eq('user_id', user.id).eq('japanese', japanese).then(() => {});
      }
    }
    return next;
  }, [user, supabase]);

  const addWrongAnswers = useCallback((phrases: Phrase[], unitId: number) => {
    addLocalWrongAnswers(phrases, unitId);
    const updated = getLocalWrongAnswers();
    setWrongAnswers({ ...updated });
    if (user) {
      const rows = phrases.map((p) => {
        const existing = updated[p.japanese];
        return {
          user_id: user.id,
          japanese: p.japanese,
          phrase: p,
          unit_id: unitId,
          count: existing?.count ?? 1,
          last_wrong: new Date().toISOString(),
        };
      });
      supabase.from('user_wrong_answers').upsert(rows).then(() => {});
    }
  }, [user, supabase]);

  const removeWrongAnswer = useCallback((japanese: string) => {
    removeLocalWrongAnswer(japanese);
    setWrongAnswers({ ...getLocalWrongAnswers() });
    if (user) {
      supabase.from('user_wrong_answers').delete().eq('user_id', user.id).eq('japanese', japanese).then(() => {});
    }
  }, [user, supabase]);

  const clearWrongAnswers = useCallback(() => {
    clearLocalWrongAnswers();
    setWrongAnswers({});
    if (user) {
      supabase.from('user_wrong_answers').delete().eq('user_id', user.id).then(() => {});
    }
  }, [user, supabase]);

  return (
    <DataContext.Provider value={{
      progress, favorites, wrongAnswers,
      markLearnCompleted, markQuizCompleted,
      toggleFavorite, addWrongAnswers, removeWrongAnswer, clearWrongAnswers,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
