/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      typography: () => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': '#e0e0e0',
            '--tw-prose-headings': '#ffffff',
            '--tw-prose-lead': '#bbbbbb',
            '--tw-prose-links': '#ff6e00',
            '--tw-prose-bold': '#ffffff',
            '--tw-prose-counters': '#888888',
            '--tw-prose-bullets': '#888888',
            '--tw-prose-hr': '#222222',
            '--tw-prose-quotes': '#e0e0e0',
            '--tw-prose-quote-borders': '#ff6e00',
            '--tw-prose-captions': '#888888',
            '--tw-prose-code': '#ff6e00',
            '--tw-prose-pre-code': '#e0e0e0',
            '--tw-prose-pre-bg': '#111111',
            '--tw-prose-th-borders': '#333333',
            '--tw-prose-td-borders': '#222222',
            'a:hover': {
              color: '#ffd600',
            },
            code: {
              backgroundColor: '#1a1a1a',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            pre: {
              backgroundColor: '#111111',
              borderWidth: '1px',
              borderColor: '#222222',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
