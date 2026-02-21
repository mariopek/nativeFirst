# Lesson 1.1 — What is Vibe Coding?

## Meta

| Key | Value |
|-----|-------|
| **Duration** | ~10 minutes |
| **Format** | Talking head + slides |
| **Resources needed** | Slide deck, camera |
| **Prerequisite** | None |

---

## Outline

- The Andrej Karpathy tweet that started it all
- Definition: what vibe coding actually means
- The spectrum: copy-paste AI vs. real vibe coding
- Why 2025/2026 is the inflection point
- What this course will teach you (and what it will not)

---

## Full Script

### Opening (Talking Head)

Hey, welcome to Vibe Code Native. I am Mario, founder of NativeFirst, and this course is going to fundamentally change how you think about building iOS apps.

Before we write a single line of Swift, I want to talk about a concept that is reshaping the entire software industry — and specifically, why it matters for native Apple development.

### The Origin (Slide: Karpathy Tweet)

[SCREEN: Screenshot of Andrej Karpathy's tweet from February 2025]

In February 2025, Andrej Karpathy — one of the founding members of OpenAI, former head of AI at Tesla — posted this on X:

> "There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists."

[SCREEN: Key phrase highlighted — "forget that the code even exists"]

That tweet went viral. It resonated because it described something thousands of developers were already doing but did not have a name for. You sit down, you describe what you want in plain English, and AI writes the code. You run it. If it works, great. If it does not, you tell the AI what went wrong. You never really look at the code.

Now — and this is important — Karpathy was being somewhat tongue-in-cheek. He was describing a specific, extreme end of the spectrum. But the term stuck, and it has evolved into something much more useful.

### The Spectrum (Slide: Spectrum Diagram)

[SCREEN: Horizontal spectrum diagram]
```
|---------|-----------|-----------|-----------|
Copy-Paste  Assisted    Guided      Full Vibe
   AI      Coding      Coding      Coding
```

Let me break down what I mean by "the spectrum of AI-assisted development."

**Copy-Paste AI** — this is the most basic level. You go to ChatGPT, ask "how do I make a list in SwiftUI," copy the response, paste it into Xcode, and hope it compiles. There is no context. No project awareness. No iteration. This is what most people think AI coding is, and honestly, it is barely useful for anything beyond boilerplate.

**Assisted Coding** — this is where tools like GitHub Copilot live. The AI sees your current file, suggests the next line or function, and you accept or reject. It is useful for autocomplete, but it does not understand your architecture, your patterns, or your intent beyond the current cursor position.

**Guided Coding** — now we are getting somewhere. This is where you use an AI tool that understands your entire project. It reads your codebase, knows your patterns, respects your architecture decisions, and generates code that fits. You still review everything. You still make decisions. But the AI is a genuine collaborator, not just a fancy autocomplete.

**Full Vibe Coding** — this is Karpathy's definition. You describe the feature, AI writes it, you run it. If it works, ship it. If it does not, describe the bug, let AI fix it. You barely look at the code.

[SCREEN: Arrow pointing to "Guided Coding" with text "Where this course lives"]

This course lives primarily in the **Guided Coding** zone, with excursions into Full Vibe Coding for appropriate tasks. Here is why: if you are building a real iOS app — something that goes on the App Store, handles user data, needs to perform well on actual devices — you cannot just "forget the code exists." You need to understand what your AI collaborator is generating. You need to steer it.

But you also do not need to write every line by hand anymore. That is the shift.

### Why Now? (Slide: Timeline)

[SCREEN: Timeline showing AI model improvements for Swift/iOS]

Why is 2025/2026 the inflection point for native iOS development specifically?

Three reasons.

**First — the models finally understand Swift.** A year ago, if you asked an AI to write SwiftUI code, you would get something that looked like React mixed with UIKit, sprinkled with deprecated APIs. It was awful. Today, Claude Opus 4.6 generates production-quality SwiftUI that follows Apple's Human Interface Guidelines, uses modern APIs like SwiftData and async/await, and actually compiles on the first try more often than not. I tested every major AI model extensively — and that improvement is not incremental. It is a step function.

**Second — project-aware tools exist now.** Claude Code, which we will use heavily in this course, does not just see your current file. It reads your entire project. Your models, your views, your networking layer, your CLAUDE.md configuration file. When it generates a new feature, it imports the right modules, follows your existing patterns, and connects to your real data layer. That did not exist eighteen months ago.

**Third — native development needs this more than anyone.** Here is something nobody talks about: the AI-assisted coding revolution has overwhelmingly favored web development. React, Next.js, Python — these ecosystems have massive training data, tons of Stack Overflow answers, and AI tools optimized for them. Native iOS? We have always been a smaller community. Our documentation is spread across Apple's developer site, WWDC videos, and tribal knowledge. AI tools that actually understand our ecosystem are a genuine competitive advantage.

### What This Course Is (and Is Not) (Talking Head)

[SCREEN: Two-column slide — "This course IS" / "This course is NOT"]

Let me be very clear about what you are signing up for.

**This course IS:**
- A practical guide to using AI tools for native iOS/macOS development
- Built around real projects you will build from scratch
- Focused on Claude Code and the Swift/SwiftUI ecosystem
- Honest about what AI gets right and what it gets wrong
- Based on months of real-world experience building production apps with AI

**This course is NOT:**
- A "no-code" or "learn to code without coding" course
- A promise that AI will replace developers
- Focused on web development, React Native, or Flutter
- A sales pitch for any single tool — we will discuss limitations honestly
- A shortcut that skips understanding fundamentals

You still need to know Swift. You still need to understand SwiftUI. But instead of spending three hours writing boilerplate networking code, you will spend three minutes describing what you need and three minutes reviewing what AI generates. That is the difference.

### Closing (Talking Head)

In the next lesson, we are going to look at the actual tools available for iOS developers in 2026 — and I will show you exactly why some of them are incredible and others are, frankly, a waste of your time. I have tested them all so you do not have to.

Let us get into it.

---

## Key Takeaways

1. **Vibe coding** was coined by Andrej Karpathy in 2025 — it describes AI-first software development
2. There is a **spectrum** from copy-paste AI to full vibe coding — this course focuses on guided coding
3. **2025/2026 is the inflection point** because models finally understand Swift, project-aware tools exist, and native dev benefits disproportionately
4. This course teaches you to **collaborate with AI**, not blindly trust it
5. You still need Swift fundamentals — AI amplifies skill, it does not replace it

---

## Homework

**Reflection exercise (5 minutes):**
Write down your current workflow for adding a new feature to an iOS app. How many steps? How long does each take? Keep this — we will revisit it at the end of Module 2 and see how the workflow changes.
