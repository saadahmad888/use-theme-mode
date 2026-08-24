/**
 * Config for the local playground.
 *
 * Read twice: once by scripts/playground.mjs to generate the pre-paint
 * script, once by app.jsx to configure <ThemeProvider>. Two custom themes
 * are included so the multi-theme path gets exercised, not just light/dark.
 */
export const playgroundOptions = {
  themes: ["light", "dark", "sepia", "forest"],
  defaultTheme: "system",
  enableSystem: true,
  storageKey: "playground-theme",
  attribute: "data-theme",
  colorSchemes: {
    light: "light",
    dark: "dark",
    sepia: "light",
    forest: "dark",
  },
};
