import { useState, useEffect } from 'react';
import Giscus from '@giscus/react';

interface Props {
  slug: string;
}

export default function Comments({ slug }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const repo = import.meta.env.PUBLIC_GISCUS_REPO || '';
  const repoId = import.meta.env.PUBLIC_GISCUS_REPO_ID || '';
  const category = import.meta.env.PUBLIC_GISCUS_CATEGORY || '';
  const categoryId = import.meta.env.PUBLIC_GISCUS_CATEGORY_ID || '';

  const isConfigured = repo && repoId && category && categoryId;

  useEffect(() => {
    // Detect current theme
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains('dark');
      setTheme(isDarkNow ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-10 mt-10">
      <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-8">
        Comments
      </h2>

      {isConfigured ? (
        <Giscus
          id="comments"
          repo={repo as `${string}/${string}`}
          repoId={repoId}
          category={category}
          categoryId={categoryId}
          mapping="specific"
          term={slug}
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={theme === 'dark' ? 'dark' : 'light'}
          lang="en"
          loading="lazy"
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Comments are not yet configured. Set up Giscus environment variables to enable discussions.
          </p>
          <a
            href="https://giscus.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline mt-2"
          >
            Learn more about Giscus
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
