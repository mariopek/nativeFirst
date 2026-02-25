import { useState } from 'react';
import AuthModal from '../auth/AuthModal';

export default function LockedLessonAuth() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm font-medium text-text-muted hover:bg-surface transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Log In
      </button>

      {showAuth && (
        <AuthModal
          initialMode="login"
          onClose={() => setShowAuth(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
