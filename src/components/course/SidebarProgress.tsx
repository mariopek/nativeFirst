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
    <div className="mb-6 p-4 rounded-xl bg-surface border border-border">
      {loggedIn ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted">
              {completedCount} of {totalLessons} completed
            </span>
            <span className="text-xs font-semibold text-accent">
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-yellow transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">
            Module {currentModule} &middot; Lesson {currentLesson}
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted">
              Module {currentModule} &middot; Lesson {currentLesson}
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Log in to track your progress
          </p>
        </>
      )}
    </div>
  );
}
