/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        "primary-dark": "#5B52E5",
        "primary-light": "#EEF0FF",
        accent: "#FF6B6B",
        "accent-green": "#4ECDC4",
        "accent-amber": "#FFE66D",
        bg: "#0A0A0F",
        surface: "#12121A",
        surface2: "#1A1A26",
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
      },
      backdropBlur: {
        xs: "4px",
      },
      boxShadow: {
        neon: "0 0 20px rgba(108,99,255,0.4)",
        "neon-lg": "0 0 40px rgba(108,99,255,0.5)",
        "neon-coral": "0 0 20px rgba(255,107,107,0.4)",
        "neon-teal": "0 0 20px rgba(78,205,196,0.4)",
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "gradient-border": "gradientBorder 4s linear infinite",
        "scanline": "scanline 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(108,99,255,0.4)" },
          "50%": { boxShadow: "0 0 25px rgba(108,99,255,0.8)" },
        },
        gradientBorder: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        scanline: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
