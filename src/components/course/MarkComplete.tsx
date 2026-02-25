import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  lessonSlug: string;
  courseSlug: string;
  nextLessonHref?: string;
}

export default function MarkComplete({ lessonSlug, courseSlug, nextLessonHref }: Props) {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setLoggedIn(true);
        // Check if already completed
        fetch('/api/auth/progress')
          .then((r) => r.json())
          .then((data) => {
            if (data.lessons?.some((l: any) => l.lesson_slug === lessonSlug)) {
              setCompleted(true);
            }
          });
      }
    });
  }, [lessonSlug]);

  if (!loggedIn) return null;

  const toggleComplete = async () => {
    setLoading(true);
    const method = completed ? 'DELETE' : 'POST';
    await fetch('/api/auth/progress', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonSlug, courseSlug }),
    });
    setCompleted(!completed);
    setLoading(false);
  };

  return (
    <div className="mt-10 pt-8 border-t border-border">
      <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border">
        <div>
          <p className="font-semibold text-white text-sm">
            {completed ? 'Lesson completed!' : 'Finished this lesson?'}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {completed ? 'Great job! Keep going.' : 'Mark it complete to track your progress.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleComplete}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
              completed
                ? 'bg-accent-green/10 text-accent-green hover:bg-accent-green/20'
                : 'bg-gradient-to-r from-accent to-accent-yellow text-white hover:from-accent/80 hover:to-accent-yellow/80'
            }`}
          >
            {completed ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </>
            ) : (
              'Mark Complete'
            )}
          </button>
          {completed && nextLessonHref && (
            <a
              href={nextLessonHref}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent to-accent-yellow text-white hover:from-accent/80 hover:to-accent-yellow/80 transition-all"
            >
              Next Lesson
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
