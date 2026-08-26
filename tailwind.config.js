module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',    // Path to your source files
    './pages/**/*.{js,ts,jsx,tsx}',  // If using `pages/` for routing
    './components/**/*.{js,ts,jsx,tsx}',  // For components
  ],
  theme: {
    extend: {
      fontFamily: {
        jetbrains: ['JetBrains Mono', 'monospace'], // Custom fonts if needed
      },
    },
  },
  plugins: [],
};