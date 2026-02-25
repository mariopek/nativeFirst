import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import AuthModal from './AuthModal';

export default function UserMenu() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showModal, setShowModal] = useState<'login' | 'signup' | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) return;

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    window.location.reload();
  };

  const handleAuthSuccess = () => {
    setShowModal(null);
    window.location.reload();
  };

  // Not logged in — show Log In / Sign Up buttons
  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal('login')}
            className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium font-nav text-text-muted hover:text-accent transition-colors rounded-lg"
          >
            Log In
          </button>
          <button
            onClick={() => setShowModal('signup')}
            className="px-3 py-1.5 text-sm font-medium font-nav text-white gradient-brand rounded-lg transition-all"
          >
            Sign Up
          </button>
        </div>

        {showModal && (
          <AuthModal
            initialMode={showModal}
            onClose={() => setShowModal(null)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </>
    );
  }

  // Logged in — show avatar dropdown
  const initial = user.email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-2 transition-colors"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-yellow flex items-center justify-center text-white text-sm font-semibold">
          {initial}
        </div>
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-xl shadow-xl border border-border py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-xs text-text-muted">Signed in as</p>
            <p className="text-sm font-medium text-white truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-text-muted hover:bg-surface-2 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
