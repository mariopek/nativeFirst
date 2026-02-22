import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginModalProps {
  redirectTo?: string;
  onClose?: () => void;
}

export default function LoginModal({ redirectTo, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    if (!supabase) {
      setStatus('error');
      setErrorMessage('Authentication service is not configured.');
      return;
    }

    setStatus('loading');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo || window.location.href,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
    } else {
      setStatus('sent');
    }
  };

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
          Check your email
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          We sent a magic link to <strong>{email}</strong>. Click the link in the email to access your course.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
        Access Your Course
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Enter the email you used to purchase. We'll send you a magic link — no password needed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
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
          {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
