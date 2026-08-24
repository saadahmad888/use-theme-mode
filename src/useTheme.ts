import { useCallback, useEffect, useState } from "react";
import {
  getConfig,
  getState,
  getThemeList,
  resetTheme as storeReset,
  schemeOf,
  setTheme as storeSet,
  subscribe,
  toggleTheme as storeToggle,
} from "./store";
import type { ThemeInput, ThemeState, UseThemeReturn } from "./types";

/**
 * Read and control the active theme.
 *
 * Works with or without `ThemeProvider` — every call site shares one store,
 * so the value never drifts between components.
 *
 * ```tsx
 * const { theme, resolvedTheme, toggleTheme } = useTheme();
 * ```
 */
export function useTheme(): UseThemeReturn {
  const [state, setState] = useState<ThemeState>(getState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const sync = () => setState(getState());
    const unsubscribe = subscribe(sync);

    // The store may have hydrated between first render and this effect.
    sync();

    return unsubscribe;
  }, []);

  const setTheme = useCallback((theme: ThemeInput) => storeSet(theme), []);
  const toggleTheme = useCallback((list?: string[]) => storeToggle(list), []);
  const setLight = useCallback(() => storeSet("light"), []);
  const setDark = useCallback(() => storeSet("dark"), []);
  const setSystem = useCallback(() => storeSet("system"), []);
  const resetTheme = useCallback(() => storeReset(), []);

  const colorScheme = schemeOf(state.resolvedTheme);

  return {
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    systemTheme: state.systemTheme,
    setTheme,
    toggleTheme,
    setLight,
    setDark,
    setSystem,
    resetTheme,
    colorScheme,
    isDark: colorScheme === "dark",
    isLight: colorScheme === "light",
    themes: getThemeList(),
    mounted,
    forcedTheme: getConfig().forcedTheme,
  };
}
