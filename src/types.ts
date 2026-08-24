/**
 * Native color scheme values understood by the CSS `color-scheme` property.
 */
export type ColorScheme = "light" | "dark";

/**
 * Where the chosen theme is persisted.
 * - `local`   → window.localStorage (default, survives restarts)
 * - `session` → window.sessionStorage (cleared when the tab closes)
 * - `none`    → nothing is written; theme resets on reload
 */
export type StorageType = "local" | "session" | "none";

/**
 * The DOM attribute used to expose the theme.
 * Use `"class"` for Tailwind, or any attribute name such as `"data-theme"`.
 */
export type Attribute = "class" | (string & {});

export interface ThemeConfig {
  /**
   * Every theme your app supports, in cycle order.
   * `"system"` must NOT be listed here — enable it with `enableSystem`.
   * @default ["light", "dark"]
   */
  themes?: string[];
  /**
   * Theme applied when the visitor has no stored preference.
   * @default "system" when `enableSystem` is true, otherwise `themes[0]`
   */
  defaultTheme?: string;
  /**
   * Allow the special `"system"` theme, which follows `prefers-color-scheme`
   * and keeps following it as the OS setting changes.
   * @default true
   */
  enableSystem?: boolean;
  /**
   * Storage key holding the preference.
   * @default "theme"
   */
  storageKey?: string;
  /**
   * Storage backend.
   * @default "local"
   */
  storage?: StorageType;
  /**
   * Attribute (or attributes) written to the root element.
   * @default "data-theme"
   */
  attribute?: Attribute | Attribute[];
  /**
   * Map a theme name to a different attribute value,
   * e.g. `{ dark: "theme-dark" }`.
   */
  value?: Record<string, string>;
  /**
   * Map each theme to a native color scheme so browser UI (scrollbars,
   * form controls, caret) matches your custom themes.
   * @default { light: "light", dark: "dark" }
   */
  colorSchemes?: Record<string, ColorScheme>;
  /**
   * Write the resolved scheme to `style.colorScheme` on the root element.
   * @default true
   */
  enableColorScheme?: boolean;
  /**
   * Suppress CSS transitions while the theme swaps, removing the
   * cross-fade smear on large pages.
   * @default false
   */
  disableTransitionOnChange?: boolean;
  /**
   * Pin the page to one theme and ignore stored preferences.
   * Useful for marketing pages or print views.
   */
  forcedTheme?: string | null;
  /**
   * Element that receives the attribute.
   * @default document.documentElement
   */
  element?: HTMLElement | null;
  /**
   * CSP nonce forwarded to the injected no-flash script.
   */
  nonce?: string;
  /**
   * Called after every applied change, including system and cross-tab updates.
   */
  onChange?: (theme: string, resolvedTheme: string) => void;
}

export interface ThemeState {
  /** The stored preference. May be `"system"`. */
  theme: string;
  /** `theme` with `"system"` resolved. `undefined` before hydration. */
  resolvedTheme: string | undefined;
  /** The OS preference, or `undefined` when unknown. */
  systemTheme: ColorScheme | undefined;
}

export type ThemeInput = string | ((current: string) => string);

export interface UseThemeReturn extends ThemeState {
  /** Set the theme. Accepts a value or an updater function. */
  setTheme: (theme: ThemeInput) => void;
  /** Advance to the next theme in `themes`. Wraps around. */
  toggleTheme: (list?: string[]) => void;
  /** Shorthand for `setTheme("light")`. */
  setLight: () => void;
  /** Shorthand for `setTheme("dark")`. */
  setDark: () => void;
  /** Shorthand for `setTheme("system")`. */
  setSystem: () => void;
  /** Clear the stored preference and fall back to the default theme. */
  resetTheme: () => void;
  /** Native color scheme of the resolved theme. */
  colorScheme: ColorScheme | undefined;
  /** `true` when the resolved theme maps to a dark color scheme. */
  isDark: boolean;
  /** `true` when the resolved theme maps to a light color scheme. */
  isLight: boolean;
  /** Every configured theme, plus `"system"` when enabled. */
  themes: string[];
  /** `false` during SSR and the first client render. Gate theme UI on this. */
  mounted: boolean;
  /** The active `forcedTheme`, if any. */
  forcedTheme: string | null;
}
