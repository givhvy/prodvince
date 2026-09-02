import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
    	extend: {
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			'text-white': '#ffffff',
    			'text-primary': 'hsl(var(--foreground))',
    			'text-tertiary': 'hsl(var(--muted-foreground))',
    			'button-primary-disabled-foreground': 'hsl(var(--muted-foreground))',
    			'foreground-disabled-danger': '#fca5a5',
    			'background-primary-default': 'hsl(var(--card))',
    			'background-primary-hover': 'hsl(var(--accent))',
    			'background-primary-active': 'hsl(var(--muted))',
    			'background-primary-disabled': 'hsl(var(--muted))',
    			'border-button-default': 'hsl(var(--border))',
    			'border-button-hover': 'hsl(var(--border))',
    			'border-button-active': 'hsl(var(--ring))',
    			'button-ghost-background': 'rgb(59 130 246 / 0.12)',
    			'button-ghost-hover': 'rgb(59 130 246 / 0.2)',
    			'button-ghost-active': 'rgb(59 130 246 / 0.28)',
    			'button-ghost-disabled': 'rgb(59 130 246 / 0.06)',
    			'button-ghost-foreground': '#93c5fd',
    			'button-ghost-disabled-foreground': 'rgb(147 197 253 / 0.45)'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)',
    			'2lg': '10px'
    		},
    		boxShadow: {
    			xs: '0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.10)'
    		},
    		fontSize: {
    			'body-medium': [
    				'14px',
    				{
    					lineHeight: '20px',
    					fontWeight: '500'
    				}
    			],
    			'caption-1-semibold': [
    				'12px',
    				{
    					lineHeight: '16px',
    					fontWeight: '600'
    				}
    			]
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			loading: {
    				to: {
    					transform: 'rotate(360deg)'
    				}
    			},
    			flip: {
    				to: {
    					transform: 'rotate(360deg)'
    				}
    			},
    			rotate: {
    				to: {
    					transform: 'rotate(90deg)'
    				}
    			},
    			orbit: {
    				'0%': {
    					transform: 'rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg))'
    				},
    				'100%': {
    					transform: 'rotate(calc(var(--angle) * 1deg + 360deg)) translateY(calc(var(--radius) * 1px)) rotate(calc((var(--angle) * -1deg) - 360deg))'
    				}
    			},
    			ripple: {
    				'0%, 100%': {
    					transform: 'translate(-50%, -50%) scale(1)'
    				},
    				'50%': {
    					transform: 'translate(-50%, -50%) scale(0.9)'
    				}
    			},
    			blob: {
    				'0%': {
    					transform: 'translate(-50%, -50%) rotate(0deg) scale(1)'
    				},
    				'33%': {
    					transform: 'translate(-50%, -50%) rotate(120deg) scale(1.1)'
    				},
    				'66%': {
    					transform: 'translate(-50%, -50%) rotate(240deg) scale(0.9)'
    				},
    				'100%': {
    					transform: 'translate(-50%, -50%) rotate(360deg) scale(1)'
    				}
    			},
    			'image-glow': {
    				'0%': {
    					opacity: '0',
    					'animation-timing-function': 'cubic-bezier(.74, .25, .76, 1)'
    				},
    				'10%': {
    					opacity: '0.5',
    					'animation-timing-function': 'cubic-bezier(.12, .01, .08, .99)'
    				},
    				'100%': {
    					opacity: '1'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			loading: 'loading 0.6s linear infinite',
    			flip: 'flip 6s infinite steps(2, end)',
    			rotate: 'rotate 3s linear infinite both',
    			orbit: 'orbit calc(var(--duration)*1s) linear infinite',
    			ripple: 'ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite',
    			blob: 'blob 7s infinite',
    			'image-glow': 'image-glow 6s ease-out 0.6s forwards'
    		},
    		spacing: {
    			'1/8': '12.5%'
    		},
    		fontFamily: {
    			heading: [
    				'var(--font-heading)',
    				'ui-sans-serif',
    				'system-ui',
    				'sans-serif'
    			],
    			subheading: [
    				'var(--font-subheading)',
    				'Georgia',
    				'Cambria',
    				'serif'
    			],
    			base: [
    				'var(--font-base)',
    				'ui-sans-serif',
    				'system-ui',
    				'sans-serif'
    			]
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
