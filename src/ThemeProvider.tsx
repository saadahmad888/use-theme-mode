import { createElement, Fragment, useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { configureTheme } from "./store";
import { themeScript } from "./script";
import type { ThemeConfig } from "./types";

export interface ThemeProviderProps extends ThemeConfig {
  children?: ReactNode;
  /**
   * Also render the blocking no-flash script.
   * Useful when the provider lives inside `<html>` in an SSR framework.
   * @default false
   */
  injectScript?: boolean;
}

/**
 * Optional configuration wrapper.
 *
 * `useTheme` works without it — reach for the provider when you need custom
 * themes, a different attribute, a custom storage key, or a forced theme.
 *
 * ```tsx
 * <ThemeProvider themes={["light", "dark", "sepia"]} attribute="data-theme">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider(props: ThemeProviderProps): ReactElement {
  const { children, injectScript = false, ...config } = props;

  // Configure before any consumer's first paint. `notify` is false because no
  // subscriber exists yet, and emitting during render is unsafe.
  useState(() => {
    configureTheme(config, false);
    return null;
  });

  const firstRun = useRef(true);

  // Every serialisable option, so prop changes reconfigure the store.
  // Callbacks and elements are read fresh on use and are excluded on purpose.
  const signature = JSON.stringify({
    ...config,
    element: undefined,
    onChange: undefined,
  });

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    configureTheme(config, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return createElement(
    Fragment,
    null,
    injectScript ? createElement(ThemeScript, config) : null,
    children
  );
}

export interface ThemeScriptProps extends ThemeConfig {}

/**
 * Renders the blocking script that applies the stored theme before first
 * paint. Place it as early inside `<head>` as possible.
 *
 * ```tsx
 * // app/layout.tsx
 * <head><ThemeScript /></head>
 * ```
 */
export function ThemeScript(props: ThemeScriptProps): ReactElement {
  return createElement("script", {
    suppressHydrationWarning: true,
    nonce: props.nonce,
    dangerouslySetInnerHTML: { __html: themeScript(props) },
  });
}
