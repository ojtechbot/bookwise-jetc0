import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      typography: (theme: any) => ({
        DEFAULT: {
            css: {
                '--tw-prose-body': theme('colors.foreground / 1'),
                '--tw-prose-headings': theme('colors.primary / 1'),
                '--tw-prose-lead': theme('colors.foreground / 1'),
                '--tw-prose-links': theme('colors.accent[DEFAULT] / 1'),
                '--tw-prose-bold': theme('colors.foreground / 1'),
                '--tw-prose-counters': theme('colors.muted.foreground / 1'),
                '--tw-prose-bullets': theme('colors.muted.foreground / 1'),
                '--tw-prose-hr': theme('colors.border / 1'),
                '--tw-prose-quotes': theme('colors.foreground / 1'),
                '--tw-prose-quote-borders': theme('colors.accent[DEFAULT] / 1'),
                '--tw-prose-captions': theme('colors.muted.foreground / 1'),
                '--tw-prose-code': theme('colors.accent.foreground / 1'),
                '--tw-prose-pre-code': theme('colors.accent.foreground / 1'),
                '--tw-prose-pre-bg': theme('colors.accent.DEFAULT / 0.15'),
                '--tw-prose-th-borders': theme('colors.border / 1'),
                '--tw-prose-td-borders': theme('colors.border / 1'),
                '--tw-prose-invert-body': theme('colors.foreground / 1'),
                '--tw-prose-invert-headings': theme('colors.primary / 1'),
                '--tw-prose-invert-lead': theme('colors.foreground / 1'),
                '--tw-prose-invert-links': theme('colors.accent[DEFAULT] / 1'),
                '--tw-prose-invert-bold': theme('colors.foreground / 1'),
                '--tw-prose-invert-counters': theme('colors.muted.foreground / 1'),
                '--tw-prose-invert-bullets': theme('colors.muted.foreground / 1'),
                '--tw-prose-invert-hr': theme('colors.border / 1'),
                '--tw-prose-invert-quotes': theme('colors.foreground / 1'),
                '--tw-prose-invert-quote-borders': theme('colors.accent[DEFAULT] / 1'),
                '--tw-prose-invert-captions': theme('colors.muted.foreground / 1'),
                '--tw-prose-invert-code': theme('colors.accent.foreground / 1'),
                '--tw-prose-invert-pre-code': theme('colors.accent.foreground / 1'),
                '--tw-prose-invert-pre-bg': 'rgba(0,0,0,0.2)',
                '--tw-prose-invert-th-borders': theme('colors.border / 1'),
                '--tw-prose-invert-td-borders': theme('colors.border / 1'),
                'code::before': { content: '""' },
                'code::after': { content: '""' },
                code: {
                    padding: '0.2em 0.4em',
                    margin: '0',
                    fontSize: '85%',
                    backgroundColor: 'rgba(135,131,120,0.15)',
                    borderRadius: '6px',
                },
                h1: {
                  fontSize: '1.5rem'
                },
                h2: {
                  fontSize: '1.25rem'
                },
                h3: {
                  fontSize: '1.1rem'
                }
            },
        },
    }),
      fontFamily: {
        body: ['"Roboto"', 'sans-serif'],
        headline: ['"Poppins"', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0px',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0px',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
