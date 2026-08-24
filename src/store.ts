import type {
  ColorScheme,
  StorageType,
  ThemeConfig,
  ThemeInput,
  ThemeState,
} from "./types";

export const MEDIA_QUERY = "(prefers-color-scheme: dark)";
export const SYSTEM = "system";

type Listener = () => void;

interface ResolvedConfig {
  themes: string[];
  defaultTheme: string;
  enableSystem: boolean;
  storageKey: string;
  storage: StorageType;
  attribute: string[];
  value: Record<string, string>;
  colorSchemes: Record<string, ColorScheme>;
  enableColorScheme: boolean;
  disableTransitionOnChange: boolean;
  forcedTheme: string | null;
  element: HTMLElement | null;
  onChange: ((theme: string, resolvedTheme: string) => void) | undefined;
}

const isBrowser = typeof window !== "undefined";

const baseConfig: ResolvedConfig = {
  themes: ["light", "dark"],
  defaultTheme: SYSTEM,
  enableSystem: true,
  storageKey: "theme",
  storage: "local",
  attribute: ["data-theme"],
  value: {},
  colorSchemes: { light: "light", dark: "dark" },
  enableColorScheme: true,
  disableTransitionOnChange: false,
  forcedTheme: null,
  element: null,
  onChange: undefined,
};

let config: ResolvedConfig = baseConfig;

let state: ThemeState = {
  theme: baseConfig.defaultTheme,
  resolvedTheme: undefined,
  systemTheme: undefined,
};

const listeners = new Set<Listener>();
let domListenersAttached = false;
let mediaQueryList: MediaQueryList | null = null;

/* ------------------------------------------------------------------ *
 * Storage — never allowed to throw. Safari private mode, sandboxed
 * iframes and blocked third-party cookies all reject storage access.
 * ------------------------------------------------------------------ */

function getStore(): Storage | null {
  if (!isBrowser || config.storage === "none") return null;
  try {
    return config.storage === "session"
      ? window.sessionStorage
      : window.localStorage;
  } catch {
    return null;
  }
}

function readStored(): string | null {
  try {
    return getStore()?.getItem(config.storageKey) ?? null;
  } catch {
    return null;
  }
}

function writeStored(theme: string): void {
  try {
    getStore()?.setItem(config.storageKey, theme);
  } catch {
    /* storage unavailable — keep the theme in memory only */
  }
}

function clearStored(): void {
  try {
    getStore()?.removeItem(config.storageKey);
  } catch {
    /* no-op */
  }
}

/* ------------------------------------------------------------------ *
 * Resolution helpers
 * ------------------------------------------------------------------ */

function isValidTheme(theme: string | null): theme is string {
  if (!theme) return false;
  if (theme === SYSTEM) return config.enableSystem;
  return config.themes.indexOf(theme) !== -1;
}

function readSystemTheme(): ColorScheme | undefined {
  if (!isBrowser || typeof window.matchMedia !== "function") return undefined;
  try {
    return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
  } catch {
    return undefined;
  }
}

function resolve(theme: string, systemTheme: ColorScheme | undefined) {
  if (theme !== SYSTEM) return theme;
  return systemTheme;
}

export function schemeOf(theme: string | undefined): ColorScheme | undefined {
  if (!theme) return undefined;
  return config.colorSchemes[theme] ?? (theme === "dark" ? "dark" : "light");
}

function getRootElement(): HTMLElement | null {
  if (!isBrowser) return null;
  return config.element ?? document.documentElement;
}

/* ------------------------------------------------------------------ *
 * DOM application
 * ------------------------------------------------------------------ */

function suppressTransitions(): () => void {
  const root = getRootElement();
  if (!root || typeof document === "undefined") return () => {};

  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;transition:none!important}"
    )
  );
  document.head.appendChild(style);

  return () => {
    // Force a reflow so the browser commits the new colors without
    // animating, then drop the override.
    void window.getComputedStyle(document.body).opacity;
    if (style.parentNode) style.parentNode.removeChild(style);
  };
}

function applyToDom(resolvedTheme: string | undefined): void {
  const root = getRootElement();
  if (!root || !resolvedTheme) return;

  const restore = config.disableTransitionOnChange
    ? suppressTransitions()
    : null;

  const attrValue = config.value[resolvedTheme] ?? resolvedTheme;

  for (const attr of config.attribute) {
    if (attr === "class") {
      const known = config.themes.map((t) => config.value[t] ?? t);
      root.classList.remove(...known);
      root.classList.add(attrValue);
    } else {
      root.setAttribute(attr, attrValue);
    }
  }

  if (config.enableColorScheme) {
    const scheme = schemeOf(resolvedTheme);
    if (scheme) root.style.colorScheme = scheme;
  }

  restore?.();
}

/* ------------------------------------------------------------------ *
 * Notification
 * ------------------------------------------------------------------ */

function emit(): void {
  for (const listener of Array.from(listeners)) listener();
}

function commit(next: ThemeState, notify = true): void {
  const changed =
    next.theme !== state.theme ||
    next.resolvedTheme !== state.resolvedTheme ||
    next.systemTheme !== state.systemTheme;

  state = next;
  applyToDom(next.resolvedTheme);

  if (!changed) return;
  if (next.resolvedTheme) config.onChange?.(next.theme, next.resolvedTheme);
  if (notify) emit();
}

/* ------------------------------------------------------------------ *
 * Browser listeners — attached lazily, released when unused
 * ------------------------------------------------------------------ */

function handleSystemChange(event: MediaQueryListEvent): void {
  const systemTheme: ColorScheme = event.matches ? "dark" : "light";
  commit({
    ...state,
    systemTheme,
    resolvedTheme: resolve(activeTheme(), systemTheme),
  });
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== config.storageKey) return;

  const next = isValidTheme(event.newValue)
    ? event.newValue
    : config.defaultTheme;

  commit({
    ...state,
    theme: next,
    resolvedTheme: resolve(
      config.forcedTheme ?? next,
      state.systemTheme
    ),
  });
}

function attachDomListeners(): void {
  if (domListenersAttached || !isBrowser) return;
  domListenersAttached = true;

  if (typeof window.matchMedia === "function") {
    try {
      mediaQueryList = window.matchMedia(MEDIA_QUERY);
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener("change", handleSystemChange);
      } else if (mediaQueryList.addListener) {
        // Safari < 14
        mediaQueryList.addListener(handleSystemChange);
      }
    } catch {
      mediaQueryList = null;
    }
  }

  if (config.storage !== "none") {
    window.addEventListener("storage", handleStorage);
  }
}

function detachDomListeners(): void {
  if (!domListenersAttached || !isBrowser) return;
  domListenersAttached = false;

  if (mediaQueryList) {
    if (mediaQueryList.removeEventListener) {
      mediaQueryList.removeEventListener("change", handleSystemChange);
    } else if (mediaQueryList.removeListener) {
      mediaQueryList.removeListener(handleSystemChange);
    }
    mediaQueryList = null;
  }

  window.removeEventListener("storage", handleStorage);
}

/* ------------------------------------------------------------------ *
 * Public store API
 * ------------------------------------------------------------------ */

function activeTheme(): string {
  return config.forcedTheme ?? state.theme;
}

/** Recompute state from storage + OS and push it to the DOM. */
function hydrate(notify = true): void {
  const stored = readStored();
  const theme = isValidTheme(stored) ? stored : config.defaultTheme;
  const systemTheme = config.enableSystem ? readSystemTheme() : undefined;

  commit(
    {
      theme,
      systemTheme,
      resolvedTheme: resolve(config.forcedTheme ?? theme, systemTheme),
    },
    notify
  );
}

/**
 * Apply configuration. Called by `ThemeProvider`, or directly when using
 * the hook without a provider.
 */
export function configureTheme(next: ThemeConfig = {}, notify = true): void {
  const themes = next.themes ?? baseConfig.themes;
  const enableSystem = next.enableSystem ?? baseConfig.enableSystem;

  config = {
    themes,
    enableSystem,
    defaultTheme:
      next.defaultTheme ?? (enableSystem ? SYSTEM : themes[0] ?? "light"),
    storageKey: next.storageKey ?? baseConfig.storageKey,
    storage: next.storage ?? baseConfig.storage,
    attribute: Array.isArray(next.attribute)
      ? next.attribute
      : [next.attribute ?? baseConfig.attribute[0]],
    value: next.value ?? baseConfig.value,
    colorSchemes: { ...baseConfig.colorSchemes, ...next.colorSchemes },
    enableColorScheme: next.enableColorScheme ?? baseConfig.enableColorScheme,
    disableTransitionOnChange:
      next.disableTransitionOnChange ?? baseConfig.disableTransitionOnChange,
    forcedTheme: next.forcedTheme ?? null,
    element: next.element ?? null,
    onChange: next.onChange,
  };

  if (isBrowser) hydrate(notify);
}

export function getConfig(): ResolvedConfig {
  return config;
}

export function getState(): ThemeState {
  return state;
}

export function getThemeList(): string[] {
  return config.enableSystem ? [...config.themes, SYSTEM] : [...config.themes];
}

export function setTheme(input: ThemeInput): void {
  if (config.forcedTheme) return;

  const requested =
    typeof input === "function" ? input(state.theme) : input;

  if (!isValidTheme(requested)) {
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV !== "production"
    ) {
      console.warn(
        `[use-theme-mode] Unknown theme "${requested}". Known themes: ${getThemeList().join(
          ", "
        )}.`
      );
    }
    return;
  }

  const systemTheme = state.systemTheme ?? readSystemTheme();
  writeStored(requested);
  commit({
    theme: requested,
    systemTheme,
    resolvedTheme: resolve(requested, systemTheme),
  });
}

export function toggleTheme(list?: string[]): void {
  const cycle = list?.length ? list : config.themes;
  if (!cycle.length) return;

  // When following the system, start from what the user is actually seeing.
  const current =
    state.theme === SYSTEM ? state.resolvedTheme ?? cycle[0] : state.theme;

  const index = cycle.indexOf(current);
  setTheme(cycle[(index + 1) % cycle.length]);
}

export function resetTheme(): void {
  clearStored();
  const systemTheme = state.systemTheme ?? readSystemTheme();
  commit({
    theme: config.defaultTheme,
    systemTheme,
    resolvedTheme: resolve(config.defaultTheme, systemTheme),
  });
}

export function subscribe(listener: Listener): () => void {
  if (isBrowser && listeners.size === 0) {
    attachDomListeners();
    // First subscriber in a fresh client — make sure state reflects reality.
    if (state.resolvedTheme === undefined) hydrate();
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) detachDomListeners();
  };
}

/** Test-only reset. Not part of the public API surface. */
export function __resetStore(): void {
  detachDomListeners();
  listeners.clear();
  config = baseConfig;
  state = {
    theme: baseConfig.defaultTheme,
    resolvedTheme: undefined,
    systemTheme: undefined,
  };
}
