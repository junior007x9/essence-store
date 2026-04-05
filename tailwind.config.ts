import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#330f4a", // O roxo da sua logo
          light: "#5a237d",  // Um roxo um pouco mais claro para efeitos de hover
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Fonte clean e moderna
      }
    },
  },
  plugins: [],
};
export default config;