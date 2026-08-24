# Changelog

All notable changes to this project are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [2.0.0] — 2026-08-24

A full TypeScript rewrite. Same idea, far fewer sharp edges.

### Added
- **Unlimited custom themes** via `themes={["light", "dark", "sepia", "nord"]}`.
- **`<ThemeScript />` and `themeScript()`** — a 0.8 kB blocking script that removes
  the flash of the wrong theme on first paint.
- **`ThemeProvider`** with `themes`, `defaultTheme`, `enableSystem`, `storageKey`,
  `storage`, `attribute`, `value`, `colorSchemes`, `enableColorScheme`,
  `disableTransitionOnChange`, `forcedTheme`, `element`, `nonce`, `onChange`.
- **`configureTheme()`** for provider-free configuration.
- **New hook returns**: `resolvedTheme`, `systemTheme`, `colorScheme`, `isDark`,
  `isLight`, `themes`, `mounted`, `forcedTheme`, `setSystem`, `resetTheme`.
- **`setTheme` accepts an updater function**, matching `useState` semantics.
- **`toggleTheme(list?)`** cycles through every theme instead of flipping two.
- **`attribute` is configurable** — `"class"` for Tailwind, any `data-*`, or an
  array to write several at once.
- **`storage: "local" | "session" | "none"`**.
- **`colorSchemes`** maps custom themes to a native `color-scheme` so scrollbars
  and form controls stay correct.
- **ESM + CJS builds** with an `exports` map, `sideEffects: false` and sourcemaps.
- **Shipped TypeScript declarations.**
- **28 unit tests** covering system tracking, cross-tab sync, blocked storage,
  forced themes, and the no-flash script.

### Fixed
- **Independent state per call site.** Every `useTheme()` created its own
  `useState`, so two components could disagree about the current theme. All call
  sites now read from one store.
- **System preference was read once and never again.** Changing the OS theme
  mid-session had no effect. A `matchMedia` listener now keeps `"system"` live.
- **`localStorage` access could throw**, breaking the whole app in Safari private
  mode, sandboxed iframes, and when third-party cookies are blocked. Every
  storage call is now guarded.
- **Corrupted or unknown stored values** were applied verbatim to the DOM. Values
  are now validated against the configured theme list.
- **Cross-tab sync ignored deletions.** Clearing storage in another tab left the
  old theme in place; it now falls back to the default.
- **`src/ThemeProvider.js` was an empty file** referenced by the docs.
- **The test file contained a stray token** and could not run.
- **No flash handling at all.** The theme was applied in an effect, after paint.

### Changed
- **Default `storageKey` is now `"theme"`** (was `"app-theme"`). Pass
  `storageKey="app-theme"` to keep existing visitors' preferences.
- **`theme` may now be `"system"`.** Use `resolvedTheme` or `isDark` when you need
  the concrete value.
- **`main` now points at a build output** instead of raw CommonJS source.

### Removed
- Nothing. `useTheme`, `theme`, `toggleTheme`, `setLight` and `setDark` all still
  work exactly as they did in 1.x.

## [1.0.1] — 2026-04-14

### Added
- Live demo deployed on Vercel and linked from the npm homepage field.
- Expanded README with usage examples and styling guides.

## [1.0.0] — 2026-04-14

### Added
- Initial release: `useTheme` with light/dark toggling, `localStorage`
  persistence, system preference detection and cross-tab sync.
