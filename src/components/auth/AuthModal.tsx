import { useState } from 'react';
import { supabase } from '../../lib/supabase';

type Mode = 'login' | 'signup';

interface AuthModalProps {
  initialMode?: Mode;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ initialMode = 'login', onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (!supabase) {
      setStatus('error');
      setErrorMessage('Authentication service is not configured.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
      } else {
        onSuccess();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
      } else {
        onSuccess();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="font-bold text-xl text-slate-900 dark:text-white mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {mode === 'login'
            ? 'Log in to access your courses and track progress.'
            : 'Sign up with the same email you used on Gumroad.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {status === 'loading'
              ? 'Please wait...'
              : mode === 'login'
                ? 'Log In'
                : 'Create Account'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setStatus('idle'); setErrorMessage(''); }}
                className="font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setStatus('idle'); setErrorMessage(''); }}
                className="font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                Log In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
