import { useState, useEffect, useRef, type FormEvent } from 'react';
import type { BlogComment } from '../../lib/constants';
// Supabase env vars configured

interface SupabaseComment {
  id: string;
  slug: string;
  author_name: string;
  comment: string;
  created_at: string;
}

interface Props {
  slug: string;
  seedComments?: BlogComment[];
}

const AVATAR_COLORS = [
  'from-purple-500 to-indigo-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-violet-500 to-purple-600',
  'from-sky-500 to-cyan-600',
  'from-lime-500 to-green-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getSupabaseConfig() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

const RATE_LIMIT_MS = 60_000; // 1 comment per minute

export default function BlogComments({ slug, seedComments = [] }: Props) {
  const [comments, setComments] = useState<
    { author: string; text: string; date: string }[]
  >([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error' | 'rate-limited'
  >('idle');
  const [usingSupabase, setUsingSupabase] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function fetchComments() {
      const config = getSupabaseConfig();
      if (!config) {
        // No Supabase — show seed comments only
        setComments(
          seedComments.map((c) => ({
            author: c.author,
            text: c.text,
            date: c.date,
          }))
        );
        return;
      }

      try {
        const res = await fetch(
          `${config.url}/rest/v1/blog_comments?slug=eq.${slug}&approved=eq.true&order=created_at.asc&select=author_name,comment,created_at`,
          {
            headers: {
              apikey: config.key,
              Authorization: `Bearer ${config.key}`,
            },
          }
        );

        if (res.ok) {
          const data: SupabaseComment[] = await res.json();
          if (data.length > 0) {
            setUsingSupabase(true);
            setComments(
              data.map((c) => ({
                author: c.author_name,
                text: c.comment,
                date: c.created_at,
              }))
            );
            return;
          }
        }
      } catch {
        // Supabase fetch failed — fall through to seed
      }

      // Fallback to seed comments
      setComments(
        seedComments.map((c) => ({
          author: c.author,
          text: c.text,
          date: c.date,
        }))
      );
    }

    fetchComments();
  }, [slug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Honeypot check
    if (honeypot) return;

    // Client-side validation
    const trimmedName = name.trim();
    const trimmedText = text.trim();

    if (trimmedName.length < 2 || trimmedName.length > 50) return;
    if (trimmedText.length < 3 || trimmedText.length > 1000) return;

    // Rate limiting
    const lastComment = localStorage.getItem(`blog-comment-ts-${slug}`);
    if (lastComment && Date.now() - Number(lastComment) < RATE_LIMIT_MS) {
      setStatus('rate-limited');
      return;
    }

    const config = getSupabaseConfig();
    if (!config) {
      setStatus('error');
      return;
    }

    setStatus('submitting');

    try {
      const res = await fetch(`${config.url}/rest/v1/blog_comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          slug,
          author_name: trimmedName,
          comment: trimmedText,
          approved: false,
        }),
      });

      if (res.ok) {
        localStorage.setItem(`blog-comment-ts-${slug}`, String(Date.now()));
        setStatus('success');
        setName('');
        setText('');
      } else {
        const errBody = await res.text().catch(() => '');
        console.error('Comment POST failed:', res.status, errBody);
        setStatus('error');
      }
    } catch (err) {
      console.error('Comment POST exception:', err);
      setStatus('error');
    }
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-10 mt-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Comments
        </h2>
        {comments.length > 0 && (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {comments.length}
          </span>
        )}
      </div>

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="space-y-4 mb-10">
          {comments.map((comment, i) => (
            <div
              key={`${comment.author}-${i}`}
              className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50"
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(comment.author)} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-sm font-bold">
                  {comment.author.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-sm text-slate-900 dark:text-white">
                    {comment.author}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(comment.date)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4">
          Leave a comment
        </h3>

        {status === 'success' ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
            <svg
              className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Thank you! Your comment has been submitted and will appear after
              review.
            </p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot — hidden from real users */}
            <div className="absolute opacity-0 top-0 left-0 h-0 w-0 -z-10 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="comment-name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Name
              </label>
              <input
                id="comment-name"
                type="text"
                required
                minLength={2}
                maxLength={50}
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="comment-text"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Comment
              </label>
              <textarea
                id="comment-text"
                required
                minLength={3}
                maxLength={1000}
                rows={4}
                placeholder="Share your thoughts..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">
                {text.length}/1000
              </p>
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Something went wrong. Please try again.
              </p>
            )}

            {status === 'rate-limited' && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Please wait a moment before posting another comment.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {status === 'submitting' ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                  Post Comment
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
