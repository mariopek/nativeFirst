import { useState, useEffect } from 'react';
import Giscus from '@giscus/react';

interface Props {
  slug: string;
}

export default function Comments({ slug }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

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
    <div className="border-t border-border pt-10 mt-10">
      <h2 className="font-display font-bold text-2xl text-white mb-8">
        Comments
      </h2>

      <Giscus
        id="comments"
        repo="mariopek/nativefirst"
        repoId="R_kgDORNu-Ww"
        category="Announcements"
        categoryId="DIC_kwDORNu-W84C2N7T"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={theme === 'dark' ? 'dark' : 'light'}
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
