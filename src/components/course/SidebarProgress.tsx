import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  totalLessons: number;
  currentModule: number;
  currentLesson: number;
}

export default function SidebarProgress({ totalLessons, currentModule, currentLesson }: Props) {
  const [completedCount, setCompletedCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setLoggedIn(true);
        fetch('/api/auth/progress')
          .then((r) => r.json())
          .then((data) => {
            setCompletedCount(data.lessons?.length || 0);
          });
      }
    });
  }, []);

  const progress = loggedIn && totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  return (
    <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
      {loggedIn ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {completedCount} of {totalLessons} completed
            </span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Module {currentModule} &middot; Lesson {currentLesson}
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Module {currentModule} &middot; Lesson {currentLesson}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log in to track your progress
          </p>
        </>
      )}
    </div>
  );
}
