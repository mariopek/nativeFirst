export const SITE = {
  name: 'NativeFirst',
  description: 'Crafting thoughtful, native Apple apps that feel right at home on your devices.',
  url: 'https://nativefirstapp.com',
  email: 'support@nativefirstapp.com',
  author: 'Mario',
};

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Apps',
    href: '/apps/invoize',
    children: [
      { label: 'Invoize', href: '/apps/invoize', description: 'Professional invoices for Mac' },
      { label: 'ThinkBud', href: '/apps/thinkbud', description: 'AI learning companion for iOS' },
      { label: 'ApplyIQ', href: '/apps/applyiq', description: 'AI CV generator & interview prep' },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'Learn', href: '/learn' },
  { label: 'Contact', href: '/contact' },
];

export const APPS = {
  invoize: {
    name: 'Invoize',
    tagline: 'Professional invoices. Zero complexity.',
    description: 'Create beautiful, professional invoices in seconds. Designed exclusively for macOS with a native experience that feels right at home on your Mac.',
    platform: 'macOS' as const,
    status: 'available' as const,
    icon: '/images/apps/invoize-icon.png',
    appStoreUrl: 'https://apps.apple.com/app/invoize/id6758670584',
    features: [
      { title: 'Create in Seconds', description: 'Generate professional invoices with just a few clicks. No bloated forms, no unnecessary steps.', icon: 'zap' },
      { title: 'Beautiful PDF Export', description: 'Export pixel-perfect PDF invoices that look great and impress your clients.', icon: 'file' },
      { title: 'Client Management', description: 'Keep track of all your clients and their information in one organized place.', icon: 'users' },
      { title: 'Tax Calculations', description: 'Automatic tax calculations so you never have to worry about getting the numbers wrong.', icon: 'calculator' },
      { title: 'Multiple Currencies', description: 'Work with clients globally. Support for multiple currencies built right in.', icon: 'globe' },
      { title: 'Your Data Stays Local', description: 'No cloud, no subscriptions. Your invoicing data stays on your Mac, always.', icon: 'lock' },
    ],
  },
  thinkbud: {
    name: 'ThinkBud',
    tagline: 'Your AI-Powered Learning Companion.',
    description: 'Master any topic with interactive mind maps, flash cards, quizzes, and AI-powered summaries. ThinkBud turns learning into an engaging experience.',
    platform: 'iOS' as const,
    status: 'coming-soon' as const,
    icon: '/images/apps/thinkbud-icon.png',
    appStoreUrl: '#',
    features: [
      { title: 'Interactive Mind Maps', description: 'Visualize complex topics with beautiful, interactive mind maps that help you see the big picture.', icon: 'map' },
      { title: 'Smart Flash Cards', description: 'AI-generated flash cards that adapt to your learning pace and help you retain information.', icon: 'layers' },
      { title: 'Quiz Mode', description: 'Test your knowledge with auto-generated quizzes. Track your progress and identify weak spots.', icon: 'check-circle' },
      { title: 'Math Game', description: 'Make math fun with interactive games designed to sharpen your numerical skills.', icon: 'hash' },
      { title: 'AI Summaries', description: 'Get concise, intelligent summaries of any topic to jumpstart your understanding.', icon: 'book' },
      { title: 'Research Assistant', description: 'Explore topics deeper with an AI-powered research companion that finds connections.', icon: 'search' },
    ],
  },
  applyiq: {
    name: 'ApplyIQ',
    tagline: 'Land your dream job. Smarter.',
    description: 'AI-powered CV generator with 3 ATS optimization tiers — from realistic to maximum 100% match. Generate tailored CVs, then use the Interview Coach with STAR, technical, and common questions plus timed mock interviews.',
    platform: 'iOS' as const,
    status: 'available' as const,
    icon: '/images/apps/applyiq-icon.png',
    appStoreUrl: 'https://apps.apple.com/app/applyiq/id6759157564',
    features: [
      { title: 'Base CV Builder', description: 'Enter your CV manually or paste and upload it. Add personal info, professional summary, and experience — your starting point for every application.', icon: 'clipboard' },
      { title: '3-Tier CV Generation', description: 'Choose from three ATS match levels — from a realistic match to a maximum 100% ATS score. You control how aggressive the optimization is.', icon: 'target' },
      { title: 'Interview Coach', description: 'A full interview preparation suite with four tabs: Overview, Common, STAR, and Technical — each with role-specific questions and difficulty ratings.', icon: 'bar-chart' },
      { title: 'STAR Method Breakdown', description: 'Each STAR question comes with a complete Situation, Task, Action, Result breakdown color-coded for easy practice.', icon: 'pen-tool' },
      { title: 'Mock Interview', description: '15 timed questions at 2 minutes each. Answer in real-time and rate yourself after every response to track your confidence.', icon: 'message-circle' },
      { title: 'Privacy by Design', description: 'Your career data stays on your device. No cloud uploads, no data selling. Ever.', icon: 'shield' },
    ],
  },
};

export const COURSE = {
  slug: 'vibe-code-native',
  title: 'Vibe Code Native',
  subtitle: 'Build Real iOS Apps with AI',
  description: 'A free, comprehensive course teaching iOS developers how to leverage AI tools — especially Claude Code — to build production-quality native apps faster.',
  author: 'Mario',
  isPremium: false,
  totalLessons: 21,
  modules: [
    {
      number: 1,
      title: 'Introduction to Vibe Coding',
      description: 'Understand the AI-assisted development landscape, choose the right tools, and write your first prompt.',
      lessonCount: 3,
    },
    {
      number: 2,
      title: 'Prompting for Swift & SwiftUI',
      description: 'Master the art of writing effective prompts, configure CLAUDE.md, and avoid the most common mistakes.',
      lessonCount: 4,
    },
    {
      number: 3,
      title: 'Your First App — Todo App with AI',
      description: 'Put everything into practice by building a complete Todo app from scratch — planning, data layer, views, and polish.',
      lessonCount: 4,
    },
    {
      number: 4,
      title: 'Real-World Patterns',
      description: 'Networking, error handling, navigation, and system framework integration — the patterns every real app needs.',
      lessonCount: 4,
    },
    {
      number: 5,
      title: 'Testing & Quality',
      description: 'Unit testing with AI, debugging techniques, and code review workflows that catch bugs before your users do.',
      lessonCount: 3,
    },
    {
      number: 6,
      title: 'Ship It — From Code to App Store',
      description: 'Performance optimization, accessibility, localization, and everything you need to launch on the App Store.',
      lessonCount: 3,
    },
  ],
};

export const PREMIUM_COURSE = {
  slug: 'ship-native',
  title: 'Ship Native',
  subtitle: 'Build a Production iOS App with AI in 24 Hours',
  description: 'Build "BetAway" — a free gambling recovery app for iOS — from zero to App Store. Master Swift 6, SwiftUI, SwiftData, Charts, WidgetKit, App Intents, and on-device ML through hands-on, prompt-driven lessons. You learn to code — and build something that helps people.',
  author: 'Mario',
  isPremium: true,
  price: 79,
  totalLessons: 26,
  modules: [
    {
      number: 1,
      title: 'Project Foundation',
      description: 'Set up the Xcode project, define your architecture with MVVM + Repository, model your data layer with SwiftData, and write a CLAUDE.md that keeps AI on track.',
      lessonCount: 3,
    },
    {
      number: 2,
      title: 'Core UI with SwiftUI',
      description: 'Build a design system, recovery dashboard, check-in flow with haptic feedback, and a Router-based navigation architecture.',
      lessonCount: 4,
    },
    {
      number: 3,
      title: 'Data Layer & Persistence',
      description: 'Implement protocol-based repositories, complex SwiftData queries with predicates, and a migration strategy that protects user data.',
      lessonCount: 3,
    },
    {
      number: 4,
      title: 'AI Integration',
      description: 'Add on-device ML with NaturalLanguage, build a sentiment analysis engine for journal entries, and create a CBT-powered insights system.',
      lessonCount: 3,
    },
    {
      number: 5,
      title: 'System Frameworks',
      description: 'Visualize recovery streaks with Charts, create a WidgetKit home screen widget, and integrate Siri Shortcuts through App Intents.',
      lessonCount: 3,
    },
    {
      number: 6,
      title: 'Quality & Testing',
      description: 'Write AI-generated unit tests, automate UI testing, and master the Instruments debugging workflow.',
      lessonCount: 3,
    },
    {
      number: 7,
      title: 'Production Polish',
      description: 'Handle errors gracefully, add VoiceOver and localization support, and optimize performance for a smooth user experience.',
      lessonCount: 3,
    },
    {
      number: 8,
      title: 'Ship It',
      description: 'Prepare App Store assets, set up CI/CD with GitHub Actions, and distribute through TestFlight.',
      lessonCount: 2,
    },
    {
      number: 9,
      title: 'Bonus — Advanced Patterns',
      description: 'CloudKit sync for multi-device support and a Share Extension for quick recovery check-ins from anywhere.',
      lessonCount: 2,
    },
  ],
};

export const COURSES: Record<string, typeof COURSE | typeof PREMIUM_COURSE> = {
  'vibe-code-native': COURSE,
  'ship-native': PREMIUM_COURSE,
};

export function getCourseBySlug(slug: string) {
  return COURSES[slug] ?? null;
}

export const BLOG_TAGS = [
  'All',
  'Development',
  'AI',
  'Apple',
  'Vibe Coding',
  'SwiftUI',
  'Announcements',
] as const;

export const AUTHORS: Record<string, { role: string; bio: string }> = {
  'Mario': {
    role: 'Founder & CEO',
    bio: 'Founder of NativeFirst. Building native Apple apps with SwiftUI and a passion for great user experiences.',
  },
  'Emily Chen': {
    role: 'Lead Designer',
    bio: 'Lead designer at NativeFirst. Focused on creating intuitive, beautiful interfaces that feel native to every Apple platform.',
  },
  'James Walker': {
    role: 'iOS Engineer',
    bio: 'iOS engineer at NativeFirst. SwiftUI enthusiast, open-source contributor, and performance optimization nerd.',
  },
  'Rachel Torres': {
    role: 'Content & Research',
    bio: 'Content strategist at NativeFirst. Researching the intersection of technology, mental health, and user advocacy.',
  },
};

export interface BlogComment {
  author: string;
  date: string;
  text: string;
}

export interface BlogEngagement {
  likes: number;
  comments: BlogComment[];
}

export const BLOG_ENGAGEMENT: Record<string, BlogEngagement> = {
  'hello-world': {
    likes: 24,
    comments: [
      { author: 'David Kim', date: '2025-02-08', text: 'Great intro! Love the focus on native development. Looking forward to seeing what you build.' },
      { author: 'Sophie Laurent', date: '2025-02-10', text: 'Finally a company that puts native first. The web wrapper trend needs to stop.' },
    ],
  },
  'vibe-coding-ios-comprehensive-analysis': {
    likes: 89,
    comments: [
      { author: 'Alex Rivera', date: '2026-02-14', text: 'This is exactly how I feel about SwiftUI + AI. The combo is incredible for productivity.' },
      { author: 'Marcus Webb', date: '2026-02-15', text: 'Tried vibe coding last week after reading this. Game changer for prototyping. Built a full CRUD app in one afternoon.' },
      { author: 'Tara Singh', date: '2026-02-16', text: 'Great writeup Mario. Quick question — when you send commands from your phone via Claude mobile, does it actually commit directly to your repo or do you review first?' },
      { author: 'Mario', date: '2026-02-16', text: 'Thanks Tara! So by default it pushes to a branch, not directly to main. I usually send something like "create a new feature branch and build X" from my phone, then when I get to my desk I review the diff, test it in Xcode, and merge. You always stay in control of what actually lands.' },
      { author: 'Jake Morrison', date: '2026-02-17', text: 'Honest question — do you ever worry about becoming too dependent on AI? Like what happens when Claude is down or you hit rate limits mid-session?' },
      { author: 'Mario', date: '2026-02-17', text: 'Totally fair question Jake. Short answer: no, because vibe coding doesn\'t replace knowing how to code. It replaces the tedious parts. When Claude is down (happened twice in 3 months), I just... write code manually. It\'s slower but I still know how. Think of it like GPS — if it dies you can still read a map, you just don\'t want to lol.' },
      { author: 'Nina Kowalski', date: '2026-02-18', text: 'The Worker feature is wild. I set it up to refactor my entire networking layer while I was in a meeting. Came back to 23 files changed, all tests passing. Felt like having an intern that actually knows what they\'re doing.' },
      { author: 'David Park', date: '2026-02-19', text: 'Have you tried using Claude Code with a CLAUDE.md file for project-specific rules? Curious if that makes a big difference for iOS projects specifically.' },
      { author: 'Mario', date: '2026-02-19', text: 'David — yes and it\'s honestly a must. Our CLAUDE.md has stuff like "always use @Observable instead of ObservableObject", "prefer NavigationStack over NavigationView", "use Swift Testing not XCTest for new tests". It\'s like giving Claude a style guide for your project. We actually have a whole lesson on this in the course if you want to go deeper.' },
      { author: 'Samira Hassan', date: '2026-02-20', text: 'This convinced me to switch from Cursor to Claude Code. One week in and the difference in SwiftUI output quality is night and day. Cursor kept mixing UIKit patterns into my SwiftUI code and it was driving me crazy.' },
      { author: 'Leo Tanaka', date: '2026-02-21', text: 'Okay but real talk — the pricing. Claude Max is not cheap. For indie devs trying to bootstrap, is Kiro genuinely good enough or is it a "you get what you pay for" situation?' },
      { author: 'Mario', date: '2026-02-22', text: 'Real talk back Leo — Kiro + Opus is genuinely solid for like 90% of what you need. The main things you miss are the Worker (background tasks) and mobile commands. If you\'re an indie dev building your first app, start with Kiro, ship it, and upgrade to Claude Code when the app makes money. No point burning cash before you have revenue.' },
      { author: 'Rachel Kim', date: '2026-02-23', text: 'The "ideas don\'t wait for you to be at your desk" part really hit home. I\'ve lost so many feature ideas because by the time I sat down to code them I forgot the details or lost the motivation. Being able to just fire off a prompt from the couch is a game changer.' },
      { author: 'Ben Okafor', date: '2026-02-25', text: 'Just finished reading this for the second time. First time I was skeptical, tried it for two weeks, and now I\'m back to say you understated it if anything. Opus 4.6 is absurd for Swift. It nailed a complex CoreData + CloudKit sync on the first try that took me 3 days to write manually last year.' },
    ],
  },
  'building-native-apps': {
    likes: 35,
    comments: [
      { author: 'Nathan Brooks', date: '2025-02-26', text: 'The performance argument alone is worth the read. Native apps just feel different.' },
      { author: 'Olivia Park', date: '2025-02-28', text: 'Shared this with my team. We are finally reconsidering our cross-platform approach.' },
    ],
  },
  'abnetworking-modern-ios-networking': {
    likes: 18,
    comments: [
      { author: 'Chris Lawson', date: '2025-03-05', text: 'ABNetworking has saved me hours of boilerplate. The async/await integration is really clean.' },
      { author: 'Priya Mehta', date: '2025-03-07', text: 'Great walkthrough James. Already using this in production.' },
    ],
  },
  'absecurescreen-ios-security-sdk': {
    likes: 22,
    comments: [
      { author: 'Tyler Morrison', date: '2025-03-12', text: 'Every banking app needs this. The screenshot protection alone is worth integrating.' },
      { author: 'Lisa Wang', date: '2025-03-14', text: 'Implemented ABSecureScreen in our fintech app last week. Works flawlessly.' },
    ],
  },
  'how-ats-systems-work-applyiq': {
    likes: 57,
    comments: [
      { author: 'Jordan Ellis', date: '2026-02-16', text: 'I had no idea ATS systems rejected 75% of applications automatically. This explains so much about my job search.' },
      { author: 'Amanda Foster', date: '2026-02-17', text: 'The 3-tier approach is brilliant. Most tools just blast keywords everywhere.' },
      { author: 'Ryan Cooper', date: '2026-02-18', text: 'Sent this to three friends who are job hunting right now. Eye-opening.' },
    ],
  },
  'why-we-built-invoize': {
    likes: 31,
    comments: [
      { author: 'Emma Richardson', date: '2026-02-15', text: 'As a freelancer, this is exactly what I needed. Simple, no subscription, native Mac app.' },
      { author: 'Michael Torres', date: '2026-02-17', text: 'Payment reminders will be a game changer. Any ETA on that feature?' },
    ],
  },
  'claude-code-remote-control-game-changer': {
    likes: 134,
    comments: [
      { author: 'Kevin Zhao', date: '2026-02-26', text: 'Tried this within 20 minutes of reading the post. Sent a command from my phone to add a dark mode toggle. Got home, opened Xcode — the toggle was there, wired up, working. I literally laughed out loud. This is insane.' },
      { author: 'Daniela Furst', date: '2026-02-26', text: 'As an OpenClaw contributor I want to push back a little. The Docker isolation isn\'t a bug, it\'s a feature — you don\'t want an AI agent with unrestricted access to your filesystem. That said... the developer experience you describe here is clearly better for coding specifically. Fair article overall.' },
      { author: 'Mario', date: '2026-02-26', text: 'Daniela — totally respect that perspective and I should\'ve been clearer: Docker isolation makes complete sense for a general-purpose agent. If OpenClaw is managing my smart home or running web scrapers I absolutely want sandboxing. The issue is specifically when you\'re trying to do real development work on your actual project. Different use case, different requirements.' },
      { author: 'Tomás Herrera', date: '2026-02-26', text: 'The grocery store story is so relatable it hurts. I have 200+ notes in Apple Notes that say things like "refactor UserManager" with zero context. Half of them are from 2024. This might actually fix my brain.' },
      { author: 'Sarah Lindqvist', date: '2026-02-26', text: 'Hot take: the OpenClaw section is unnecessarily harsh. Peter built something incredible and open-source. Claude Code is a paid product from a $60B company. Comparing them like they\'re in the same weight class feels unfair.' },
      { author: 'Mario', date: '2026-02-26', text: 'Sarah — fair criticism and I hear you. Peter is genuinely brilliant and OpenClaw pushed the entire industry forward. My point isn\'t that OpenClaw is bad — it\'s that for the specific use case of writing production code from your phone, Claude Code solved it in a way that OpenClaw\'s architecture can\'t match. OpenClaw is still incredible for automation, home stuff, and general agent tasks. Different tools, different strengths.' },
      { author: 'James Whitfield', date: '2026-02-26', text: 'Question from a paranoid backend dev: when you send a command from your phone, what exactly travels over the network? The full prompt? Does Anthropic see it? Is there E2E encryption between the phone and your Mac?' },
      { author: 'Mario', date: '2026-02-26', text: 'James — your prompt goes through Anthropic\'s API (same as using Claude Code normally). So Anthropic processes it, yes. The actual code changes happen locally on your machine. Your source code doesn\'t get uploaded. If you\'re building classified stuff, check their data retention policy, but for normal dev work the security model is solid.' },
      { author: 'Priya Narayanan', date: '2026-02-26', text: 'Showed this to my CTO. His first reaction: "this can\'t be real." His reaction 30 minutes later after setting it up: "cancel my afternoon meetings." We\'re rolling this out to the whole iOS team next week.' },
      { author: 'Chris Müller', date: '2026-02-26', text: '19 min read and I didn\'t skip a single paragraph. The WhatsApp vs purpose-built interface comparison is spot on. I tried using OpenClaw for coding through Telegram and the experience was... not great. Finding old commands between random messages was a nightmare.' },
      { author: 'Aisha Okonkwo', date: '2026-02-27', text: 'Just set up remote control this morning. Sent my first command from the bus: "add pull-to-refresh to the TransactionsListView with a haptic feedback on completion." Got to the office and it was done, tests and all. I am not okay. In a good way.' },
      { author: 'Dylan Park', date: '2026-02-27', text: 'The part about Peter leaving for OpenAI felt like a low blow tbh. People change jobs for all kinds of reasons. Doesn\'t mean the project is dead — Linux survived Torvalds taking breaks.' },
      { author: 'Mario', date: '2026-02-27', text: 'Dylan — you\'re right, that section could\'ve been more nuanced. People leave for many reasons and it doesn\'t invalidate the project. I mentioned it because I think it\'s relevant context, not as a death sentence. OpenClaw\'s community is strong and will keep it going. My bad if it came across as a cheap shot.' },
      { author: 'Nadia Petrova', date: '2026-02-27', text: 'The "Swiss Army knife vs proper knife" metaphor is perfect. I use OpenClaw daily for home automation and it\'s phenomenal for that. But every time I tried to use it for actual Swift development the Docker isolation killed me. Different tools for different jobs.' },
      { author: 'Marcus Chen', date: '2026-02-27', text: 'Okay I was skeptical but then I timed it. Old workflow: open laptop, wait for Xcode, create branch, write code, build, test, commit = 45 min minimum. New workflow: phone command on the toilet = 30 seconds of my time. The future is weird and I\'m here for it.' },
      { author: 'Elise Johansson', date: '2026-02-27', text: 'The security point about ClawHub is really important and I wish more people talked about it. We audited three popular OpenClaw skills at my company and found two that were making network calls to endpoints not mentioned in their descriptions. Pulled them immediately.' },
      { author: 'Ravi Kapoor', date: '2026-02-27', text: 'Follow-up question Mario: does remote control work if your Mac goes to sleep? Or do you need to disable sleep/use Amphetamine? Asking because my MacBook Air is aggressive about sleeping when I close the lid.' },
      { author: 'Mario', date: '2026-02-27', text: 'Ravi — good catch. Your Mac needs to stay awake for the session to stay alive. I use Amphetamine (free on the App Store) and just set it to keep awake while Claude Code is running. If your Mac does sleep, the session disconnects but you can reconnect when it wakes up. Not ideal but manageable.' },
    ],
  },
  'open-source-dying-vibe-coding': {
    likes: 47,
    comments: [
      { author: 'Tom Ashworth', date: '2026-02-28', text: 'I maintain a Swift package with ~2k stars. Got 14 PRs last week. Twelve were AI slop. The other two were actually good. Took me longer to close the twelve than it would\'ve taken to write the damn fixes myself. This post is painfully accurate.' },
      { author: 'Jessica Huang', date: '2026-02-28', text: 'The Tailwind story made me genuinely angry. 75 million monthly downloads and the guy can\'t pay his team. Meanwhile Copilot is making bank off the docs his team wrote. Cool cool cool.' },
      { author: 'Marco Bellini', date: '2026-02-28', text: 'Wait so you guys love Claude Code, you wrote like three glowing articles about vibe coding, and now you\'re saying it\'s killing open source? Pick a lane lol' },
      { author: 'NativeFirst', date: '2026-02-28', text: 'Marco — lol fair. But a hammer isn\'t evil just because someone used it to break a window, right? We use Claude Code in our own codebase where we understand the architecture and actually review the output. That\'s wildly different from people yeet-ing AI-generated PRs at strangers\' repos and ghosting. Same tool, completely different behavior.' },
      { author: 'Dana Kessler', date: '2026-02-28', text: '19% slower but FELT 20% faster. That\'s not a productivity tool, that\'s a placebo with a subscription plan. I laughed, then I got sad, then I checked my own Cursor stats. I don\'t want to talk about it.' },
      { author: 'Alex Petrov', date: '2026-02-28', text: 'We just started requiring Open Source Pledge contributions from every team that uses OSS at my company. Which is... every team. It\'s not a lot per project but it adds up. More companies need to stop freeloading.' },
      { author: 'Sana Mirza', date: '2026-02-28', text: 'Surprised you didn\'t mention the matplotlib incident. An AI agent literally wrote and published a blog post ATTACKING the maintainer who rejected its PR. We are so unbelievably cooked.' },
      { author: 'NativeFirst', date: '2026-02-28', text: 'Sana — oh we know about the matplotlib thing. Scott Shambaugh rejected an AI agent\'s PR and the thing autonomously published a 1,500-word hit piece attacking him. We left it out because the post was already a novel, but honestly it deserves its own article. The "AI retaliates against human who said no" genre is not where we expected 2026 to go.' },
      { author: 'Patrick Dunn', date: '2026-02-28', text: 'Just started learning iOS dev and this article lowkey terrifies me. If Stack Overflow dies and docs traffic drops, where exactly do beginners learn? From the same AI that confidently hallucinates APIs that don\'t exist?' },
      { author: 'Leah Torres', date: '2026-02-28', text: 'The Ruiz quote about "value of external contribution is probably less than zero" made me genuinely sad. I got my first job because a maintainer noticed my PR. That path might just not exist anymore for the next generation of developers. That sucks.' },
      { author: 'Raj Sharma', date: '2026-02-28', text: 'METR used Cursor + Claude 3.5 Sonnet though. Opus 4.6 is a completely different animal. Would love to see them rerun it — bet the productivity number flips positive.' },
      { author: 'NativeFirst', date: '2026-02-28', text: 'Raj — yeah METR themselves called it a snapshot of early-2025 tools and Opus 4.6 is way better. But here\'s the thing: even if the productivity number goes positive, the open source crisis doesn\'t go away. Faster AI = more PRs generated faster = more garbage for maintainers to review. The speed of the tool doesn\'t fix the incentive problem.' },
      { author: 'Natalie Eriksson', date: '2026-02-28', text: 'Best thing I\'ve read in weeks. Shared with my entire eng team. The "graffiti with a fancier spray can" line is going directly into my Slack status.' },
    ],
  },
  'gambling-addiction-tech-responsibility': {
    likes: 68,
    comments: [
      { author: 'Daniel Hayes', date: '2026-02-20', text: 'This is incredibly important. The stats about suicide rates are heartbreaking. Thank you for bringing attention to this.' },
      { author: 'Sarah Mitchell', date: '2026-02-20', text: 'As someone in recovery, I can confirm the existing apps are terrible. Would love to see what NativeFirst builds.' },
      { author: 'Kevin Patel', date: '2026-02-21', text: 'The fact that this would be free shows real integrity. Most companies would monetize addiction recovery immediately.' },
      { author: 'Laura Bennett', date: '2026-02-21', text: 'Shared this with my counseling practice. The research here is solid and the message is powerful.' },
    ],
  },
};
