import type { Config } from "tailwindcss";

export const colors = {
  'elephant': '#283244',
  'midnight-express': '#212838'
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: colors,
      backgroundImage: {},
      gridTemplateColumns: {
        'game-layout': 'repeat(30, 1fr)',
      },
      gridTemplateRows: {
        'game-layout': 'repeat(30, 1fr)',
      }
    },
  },
  plugins: [],
};
export default config;
