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
    appStoreUrl: '#',
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
    description: 'AI-powered CV generator with 3 ATS optimization tiers — from realistic to maximum 100% match. Generate tailored CVs, then prep for interviews with STAR questions, technical deep-dives, and timed mock interviews.',
    platform: 'iOS' as const,
    status: 'coming-soon' as const,
    icon: '/images/apps/applyiq-icon.svg',
    appStoreUrl: '#',
    features: [
      { title: '3-Tier CV Generation', description: 'Choose from three ATS match levels — from a realistic match to a maximum 100% ATS score. You control how aggressive the optimization is.', icon: 'target' },
      { title: 'ATS Match Score', description: 'See your exact ATS compatibility percentage for each CV variant before you apply. No more guessing.', icon: 'bar-chart' },
      { title: 'Interview Prep', description: 'After generating your CV, get a complete interview preparation kit with behavioral, STAR-method, and technical questions tailored to the role.', icon: 'clipboard' },
      { title: 'STAR Method Questions', description: 'Practice with AI-generated STAR format questions specific to the job description so you nail every behavioral question.', icon: 'pen-tool' },
      { title: 'Mock Interview', description: 'Enter a timed mock interview where you answer questions in real-time. Practice under pressure and build confidence.', icon: 'message-circle' },
      { title: 'Privacy by Design', description: 'Your career data stays on your device. No cloud uploads, no data selling. Ever.', icon: 'shield' },
    ],
  },
};

export const BLOG_TAGS = [
  'All',
  'Development',
  'AI',
  'Apple',
  'Vibe Coding',
  'SwiftUI',
  'Announcements',
] as const;
