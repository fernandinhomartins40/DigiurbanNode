
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: [
					"Open Sans",
					"ui-sans-serif",
					"system-ui",
					"sans-serif",
				],
				title: [
					"Lato",
					"ui-sans-serif",
					"system-ui",
					"sans-serif",
				],
				body: [
					"Open Sans",
					"ui-sans-serif",
					"system-ui",
					"sans-serif",
				],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					50: "#f3f1ff",
					100: "#e9e5ff",
					200: "#d5cfff",
					300: "#b7a9ff",
					400: "#9478ff",
					500: "#7341ff",
					600: "#631bff",
					700: "#611bf8",
					800: "#4607d0",
					900: "#3c08aa",
					950: "#220174",
					DEFAULT: "#611bf8",
				},
				neutral: {
					50: "#f7f7f7",
					100: "#eeeeee",
					200: "#e0e0e0",
					300: "#cacaca",
					400: "#b1b1b1",
					500: "#999999",
					600: "#7f7f7f",
					700: "#676767",
					800: "#545454",
					900: "#464646",
					950: "#282828",
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			borderRadius: {
				none: "0px",
				sm: "6px",
				DEFAULT: "12px",
				md: "18px",
				lg: "24px",
				xl: "36px",
				"2xl": "48px",
				"3xl": "72px",
				full: "9999px",
			},
			spacing: {
				0: "0px",
				1: "4px",
				2: "8px",
				3: "12px",
				4: "16px",
				5: "20px",
				6: "24px",
				7: "28px",
				8: "32px",
				9: "36px",
				10: "40px",
				11: "44px",
				12: "48px",
				14: "56px",
				16: "64px",
				20: "80px",
				24: "96px",
				28: "112px",
				32: "128px",
				36: "144px",
				40: "160px",
				44: "176px",
				48: "192px",
				52: "208px",
				56: "224px",
				60: "240px",
				64: "256px",
				72: "288px",
				80: "320px",
				96: "384px",
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
