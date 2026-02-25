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
      <div className="rounded-2xl border border-accent-green/30 bg-accent-green/10 p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-bold text-lg text-white mb-2">
          Check your email
        </h3>
        <p className="text-sm text-text-muted">
          We sent a magic link to <strong>{email}</strong>. Click the link in the email to access your course.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-bg p-6 sm:p-8">
      <h3 className="font-bold text-lg text-white mb-2">
        Access Your Course
      </h3>
      <p className="text-sm text-text-muted mb-6">
        Enter the email you used to purchase. We'll send you a magic link — no password needed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-text-muted mb-1">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-white placeholder-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
          />
        </div>

        {status === 'error' && (
          <p className="text-sm text-accent-pink">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-yellow text-white font-semibold hover:from-accent/80 hover:to-accent-yellow/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-text-muted hover:text-white transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
