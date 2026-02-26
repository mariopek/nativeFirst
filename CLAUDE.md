# NativeFirst Project Guidelines

## Blog Writing Style

When writing blog posts for NativeFirst, follow these tone and style rules:

### Voice & Tone
- **Conversational and relaxed.** Write like you are talking to a smart friend over coffee, not presenting at a conference. Avoid corporate stiffness.
- **Slightly humorous.** Sprinkle in dry humor, light sarcasm, and self-aware jokes. Never forced, never cringe. If a joke does not land naturally, skip it.
- **Human and honest.** Admit mistakes, show frustration, share genuine excitement. Readers should feel a real person behind the words, not a marketing department.
- **Confident but not arrogant.** Have strong opinions, back them up, but stay approachable. "This is what I found" beats "This is the absolute truth."

### Writing Rules
- Use first person singular ("I tested", "I found", "I was on the tram when...").
- Short sentences are your friend. Mix them with longer ones for rhythm.
- Start paragraphs with punchy lines. Do not bury the point.
- Swear sparingly if it fits the moment. One well-placed "damn" beats ten exclamation marks.
- Use real anecdotes and stories. "Last Tuesday, I was debugging at 2 AM and..." is always better than "Developers often encounter..."
- Avoid buzzwords and marketing speak. Never say "leverage", "synergy", "ecosystem" (unless making fun of it), "cutting-edge", or "revolutionize" without earning it.
- Make technical content accessible. Explain like the reader is smart but might not know this specific thing.
- Use analogies from everyday life to explain complex concepts.
- End sections with a clear takeaway or a thought-provoking line, not a summary paragraph that repeats what you just said.

### Structure
- Hook the reader in the first two sentences. No throat-clearing intros.
- Use `---` dividers between major sections.
- Keep paragraphs short (2-4 sentences max).
- Use bold for key phrases and emphasis, not for decoration.
- Code examples should be real and runnable, not pseudocode.
- Images should illustrate concepts, not just decorate the page.

### What NOT to Do
- Do not write like a press release.
- Do not hedge every statement with "in my opinion" or "arguably". Just say it.
- Do not use emojis in body text (section headers are fine sparingly).
- Do not write clickbait titles. Be direct and descriptive.
- Do not pad content. If a point is made in one paragraph, do not restate it in three more.
- Never start a blog post with "In today's fast-paced world..." or anything that sounds like a high school essay.

### Language
- Blog posts are written in **English**.
- Use American English spelling (color, not colour).
- Contractions are fine and encouraged (don't, won't, it's) — they sound more natural.

## Technical Stack

- **Framework:** Astro with MDX
- **Styling:** Tailwind CSS
- **Deployment:** Cloudflare Pages
- **Blog images:** SVG format, stored in `/public/images/blog/`
- **Blog posts:** MDX files in `/src/content/blog/`
- **Blog frontmatter:** title, description, pubDate, tags, author ("Mario"), coverImage, coverImageAlt
