/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080a",
          900: "#0c0d10",
          850: "#111216",
          800: "#16181d",
          700: "#22252c",
        },
        fg: {
          DEFAULT: "#ededef",
          muted: "#9a9ca5",
          dim: "#62656e",
        },
        signal: {
          DEFAULT: "#ff6b2c",
          soft: "#ff8a55",
        },
        ok: "#3ddc97",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      maxWidth: {
        page: "72rem",
      },
      keyframes: {
        marquee: { to: { transform: "translateX(-50%)" } },
        scan: { "0%": { top: "0%" }, "100%": { top: "100%" } },
        blink: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.2 } },
        flow: { to: { strokeDashoffset: "-24" } },
        drift: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(28px)" } },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        scan: "scan 3.2s ease-in-out infinite alternate",
        blink: "blink 1.4s ease-in-out infinite",
        flow: "flow 1s linear infinite",
      },
    },
  },
  plugins: [],
};
