# content-queue

Ready-to-publish blog posts, held in reserve. **This is the guarantee that a
post goes out every day even when everything else fails.**

Files here are complete `.mdx` posts, identical to `src/content/blog/*.mdx`
except that the frontmatter says:

```
pubDate: PUBDATE_PLACEHOLDER
```

Nothing here is picked up by Astro — the content collection only globs
`src/content/blog/`, so a queued post is invisible to the site until it's
published.

## Publishing from the queue

```bash
scripts/blog-from-queue.sh            # oldest queued post
scripts/blog-from-queue.sh <slug>     # a specific one
```

That stamps today's date, moves the file into `src/content/blog/`, and runs the
normal preflight → commit → push → verify-live pipeline. If publishing fails
for any reason, the post is put back in the queue rather than lost.

## Keeping it stocked

The scheduled tasks (`daily-blog`, `daily-blog-catchup`) fall back to this
queue when research or writing fails. **Aim for 3+ posts in here at all times.**

Good queue candidates are *evergreen* — a post about a technique, a comparison,
or a lesson learned holds for weeks. Avoid queuing anything tied to "this week's
news", because it goes stale sitting here. If a queued post does reference dated
news, re-read it before publishing and adjust the framing.

When you publish a fresh post normally and the queue is short, write one extra
evergreen piece into the queue while you already have the context loaded.
