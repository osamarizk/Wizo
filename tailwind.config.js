/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#fafafa",
        splash: "#FFFF",
        onboarding: "#E6E8F0",
        secondary: {
          DEFAULT: "#D24726",
          100: "#FF9001",
          200: "#FF8E01",
        },
        maroon: { DEFAULT: "#9F54B6" },
        gradient: {
          light: "#EDF1F4",
          medium: "#C8D1E7",
          dark: "#6D83F2",
        },
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
        gray: {
          100: "#CDCDE0",
        },
      },
      fontFamily: {
        // Poppins Fonts (for LTR / English) - Keep as is
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],

        // Cairo Fonts for Arabic (all 't-' prefixes now mapped to Cairo)
        // These values on the RIGHT (e.g., "Cairo-Light") MUST EXACTLY match the keys you use in useFonts.js
        "t-thin": ["Cairo-ExtraLight"], // Cairo has ExtraLight
        "t-extralight": ["Cairo-ExtraLight"],
        "t-light": ["Cairo-Light"],
        "t-regular": ["Cairo-Regular"],
        "t-medium": ["Cairo-Medium"],
        "t-semibold": ["Cairo-SemiBold"],
        "t-bold": ["Cairo-Bold"],
        "t-extrabold": ["Cairo-ExtraBold"], // Cairo has a distinct ExtraBold
        "t-black": ["Cairo-Black"], // Cairo has a distinct Black
      },
    },
  },
  plugins: [],
};
