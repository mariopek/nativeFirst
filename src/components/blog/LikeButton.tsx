import { useState, useEffect } from 'react';

interface Props {
  slug: string;
  seedLikes?: number;
}

export default function LikeButton({ slug, seedLikes = 0 }: Props) {
  const [likes, setLikes] = useState(seedLikes);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    // Check localStorage for previous like
    const liked = localStorage.getItem(`blog-liked-${slug}`);
    if (liked === 'true') {
      setHasLiked(true);
    }

    // Fetch current like count from Supabase
    async function fetchLikes() {
      try {
        const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
        const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) return;

        const res = await fetch(
          `${supabaseUrl}/rest/v1/blog_likes?slug=eq.${slug}&select=likes`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setLikes(seedLikes + data[0].likes);
          }
        }
      } catch {
        // Supabase not configured — fail silently
      }
    }

    fetchLikes();
  }, [slug, seedLikes]);

  async function handleLike() {
    if (hasLiked) return;

    // Optimistic update
    setLikes((prev) => prev + 1);
    setHasLiked(true);
    localStorage.setItem(`blog-liked-${slug}`, 'true');

    // Persist to Supabase
    try {
      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) return;

      await fetch(`${supabaseUrl}/rest/v1/rpc/increment_blog_likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ post_slug: slug }),
      });
    } catch {
      // Supabase not configured — fail silently
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
        hasLiked
          ? 'bg-accent-pink/10 text-accent-pink cursor-default'
          : 'bg-surface-2 text-text-muted hover:bg-accent-pink/15 hover:text-accent-pink cursor-pointer'
      }`}
      aria-label={hasLiked ? 'Already liked' : 'Like this post'}
    >
      {hasLiked ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )}
      <span>{likes}</span>
    </button>
  );
}
