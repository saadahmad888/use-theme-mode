# use-theme-mode 🌗

[![npm version](https://img.shields.io/npm/v/use-theme-mode.svg)](https://www.npmjs.com/package/use-theme-mode)
[![npm downloads](https://img.shields.io/npm/dm/use-theme-mode.svg)](https://www.npmjs.com/package/use-theme-mode)
[![bundle size](https://img.shields.io/badge/gzip-1.8%20kB-brightgreen)](https://bundlephobia.com/package/use-theme-mode)
[![types](https://img.shields.io/badge/types-included-blue)](https://www.npmjs.com/package/use-theme-mode)
[![license](https://img.shields.io/npm/l/use-theme-mode.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://use-theme-mode-demo.vercel.app/)

A tiny, dependency-free theme engine for React. It owns the *state* — which theme is active, where it's stored, and what the OS prefers — and leaves every pixel of styling to you.

**1.8 kB gzipped. Zero dependencies. No flash. Works in Next.js.**

👉 **[Try the live demo](https://use-theme-mode-demo.vercel.app/)**

---

## What's new in 2.0

Version 2 is a full rewrite in TypeScript. It closes the gaps that made v1 awkward in real apps.

| | v1 | v2 |
| :--- | :--- | :--- |
| Themes | light + dark only | unlimited custom themes |
| System mode | read once at startup | live, keeps following the OS |
| Shared state | each `useTheme()` had its own copy | one store, every call site in sync |
| Flash on load | yes | eliminated with `<ThemeScript />` |
| Module format | CommonJS source | ESM + CJS, tree-shakeable |
| Types | none | first-class, shipped |
| Target attribute | `data-theme`, hardcoded | any attribute, or `class` for Tailwind |
| Storage key | `app-theme`, hardcoded | configurable, plus `session` / `none` |
| Blocked storage | threw | handled |

Upgrading? Jump to the [migration guide](#-migrating-from-v1).

---

## ✨ Features

- **Unlimited themes** — not just light and dark. Ship `sepia`, `nord`, `high-contrast`, whatever your design system needs.
- **True system mode** — follows `prefers-color-scheme` and keeps following it when the visitor changes their OS setting mid-session.
- **No flash** — a 0.8 kB blocking script paints the right theme before the first frame.
- **One shared store** — call `useTheme()` in twenty components; they all read the same value and re-render together.
- **Cross-tab sync** — change the theme in one tab, every other tab follows.
- **Native color scheme** — sets `color-scheme` so scrollbars, form controls and the text caret match your theme, including custom ones.
- **Framework agnostic** — plain CSS, CSS variables, Tailwind, MUI, Chakra, styled-components.
- **SSR safe** — Next.js App Router, Remix, Astro, Gatsby.
- **Zero dependencies**, ESM + CJS, full TypeScript types.

---

## 📦 Install

```bash
npm install use-theme-mode
# pnpm add use-theme-mode
# yarn add use-theme-mode
# bun add use-theme-mode
```

React 16.8 or newer. No provider required.

---

## 🚀 Quick start

```jsx
import { useTheme } from "use-theme-mode";

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  // Avoids a hydration mismatch on server-rendered pages.
  if (!mounted) return <button aria-hidden />;

  return (
    <button onClick={() => toggleTheme()}>
      {resolvedTheme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
```

Then style against the attribute the hook writes to `<html>`:

```css
:root[data-theme="light"] {
  --bg: #ffffff;
  --text: #111111;
}

:root[data-theme="dark"] {
  --bg: #0f172a;
  --text: #e5e7eb;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

That's the whole integration. No provider, no config.

---

## 🌓 Killing the flash

Without a blocking script, the browser paints your default theme, React boots, and the page snaps to dark. Add `<ThemeScript />` and that never happens.

### Next.js (App Router)

```tsx
// app/layout.tsx
import { ThemeScript } from "use-theme-mode";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` is expected: the script intentionally edits the element before React hydrates.

### Vite / CRA / any static HTML

`themeScript()` returns a plain string, so you can inline it during your build:

```js
// vite.config.js
import { defineConfig } from "vite";
import { themeScript } from "use-theme-mode";

export default defineConfig({
  plugins: [
    {
      name: "theme-script",
      transformIndexHtml(html) {
        return html.replace(
          "</head>",
          `<script>${themeScript()}</script></head>`
        );
      },
    },
  ],
});
```

Pass the same options you pass to `ThemeProvider` so the script and the runtime agree.

---

## 🎨 Custom themes

```jsx
import { ThemeProvider, useTheme } from "use-theme-mode";

<ThemeProvider
  themes={["light", "dark", "sepia", "nord"]}
  colorSchemes={{ sepia: "light", nord: "dark" }}
  defaultTheme="system"
>
  <App />
</ThemeProvider>;
```

```jsx
function ThemePicker() {
  const { theme, themes, setTheme } = useTheme();

  return themes.map((name) => (
    <button
      key={name}
      onClick={() => setTheme(name)}
      aria-pressed={theme === name}
    >
      {name}
    </button>
  ));
}
```

`colorSchemes` tells the browser whether a custom theme is light or dark, so native scrollbars and form controls stay correct.

---

## 💨 Tailwind CSS

Tailwind's `dark:` variant keys off a class, so switch the attribute:

```jsx
<ThemeProvider attribute="class">
  <App />
</ThemeProvider>
```

**Tailwind v4** — add one line to your CSS:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

**Tailwind v3** — set it in the config:

```js
// tailwind.config.js
module.exports = { darkMode: "class" };
```

Need both a class and an attribute? `attribute={["class", "data-theme"]}`.

---

## 🧩 API

### `useTheme()`

| Returns | Type | Description |
| :--- | :--- | :--- |
| `theme` | `string` | The stored preference. May be `"system"`. |
| `resolvedTheme` | `string \| undefined` | `theme` with `"system"` resolved. `undefined` until mounted. |
| `systemTheme` | `"light" \| "dark" \| undefined` | What the OS currently prefers. |
| `colorScheme` | `"light" \| "dark" \| undefined` | Native scheme of the resolved theme. |
| `isDark` / `isLight` | `boolean` | Convenience flags. |
| `themes` | `string[]` | Configured themes, plus `"system"` when enabled. |
| `mounted` | `boolean` | `false` during SSR and the first client render. |
| `forcedTheme` | `string \| null` | Active override, if any. |
| `setTheme` | `(theme \| updaterFn) => void` | Set the theme. |
| `toggleTheme` | `(list?: string[]) => void` | Advance to the next theme, wrapping around. |
| `setLight` / `setDark` / `setSystem` | `() => void` | Shorthands. |
| `resetTheme` | `() => void` | Clear storage and fall back to the default. |

### `<ThemeProvider>`

Optional. Only needed to change defaults.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `themes` | `string[]` | `["light", "dark"]` | Every theme, in cycle order. |
| `defaultTheme` | `string` | `"system"` | Used when nothing is stored. |
| `enableSystem` | `boolean` | `true` | Allow the `"system"` theme. |
| `storageKey` | `string` | `"theme"` | Where the preference lives. |
| `storage` | `"local" \| "session" \| "none"` | `"local"` | Persistence backend. |
| `attribute` | `string \| string[]` | `"data-theme"` | Use `"class"` for Tailwind. |
| `value` | `Record<string, string>` | `{}` | Remap a theme to a different attribute value. |
| `colorSchemes` | `Record<string, "light" \| "dark">` | `{ light, dark }` | Native scheme per theme. |
| `enableColorScheme` | `boolean` | `true` | Write `style.color-scheme`. |
| `disableTransitionOnChange` | `boolean` | `false` | Suppress CSS transitions during the swap. |
| `forcedTheme` | `string \| null` | `null` | Pin the page to one theme. |
| `element` | `HTMLElement` | `document.documentElement` | Target element. |
| `nonce` | `string` | — | CSP nonce for the injected script. |
| `onChange` | `(theme, resolvedTheme) => void` | — | Fires on every applied change. |
| `injectScript` | `boolean` | `false` | Also render `<ThemeScript />`. |

### `<ThemeScript>` and `themeScript()`

Same options as the provider. The component renders a `<script>` tag; the function returns the raw string for non-React templates.

### `configureTheme(options)`

Configure the store without a provider — handy in a plain entry file.

```js
import { configureTheme } from "use-theme-mode";

configureTheme({ themes: ["light", "dark", "sepia"], storageKey: "ui-theme" });
```

---

## 🧠 How it works

1. `<ThemeScript />` reads storage and `prefers-color-scheme`, then writes the attribute — before the first paint.
2. On mount, the store reads the same sources and takes over.
3. `setTheme` writes to storage, updates the attribute and `color-scheme`, and notifies every subscriber.
4. A `matchMedia` listener keeps `"system"` honest when the OS changes.
5. A `storage` listener keeps other tabs in step.

All DOM and storage access is wrapped — blocked storage or a missing `matchMedia` degrades quietly instead of throwing.

---

## 🔀 Migrating from v1

Most apps need one change or none.

**1. The default storage key changed from `app-theme` to `theme`.** Keep existing visitors' preferences by pinning the old key:

```jsx
<ThemeProvider storageKey="app-theme">
  <App />
</ThemeProvider>
```

**2. `theme` can now be `"system"`.** If you branch on the theme, read `resolvedTheme` instead:

```diff
- const { theme } = useTheme();
- const isDark = theme === "dark";
+ const { isDark } = useTheme();
```

**3. `toggleTheme` cycles through `themes`.** With the default two themes it behaves exactly as before.

`setLight()`, `setDark()` and `toggleTheme()` all still work. `theme` is still a string.

---

## 📋 Compatibility

React 16.8+ · Next.js (Pages + App Router) · Remix · Vite · CRA · Astro · Gatsby · Node 18+ for the build.

---

## 🤝 Contributing

Issues and pull requests are welcome.

```bash
git clone https://github.com/saadahmad888/use-theme-mode.git
cd use-theme-mode
npm install
npm test          # 28 tests
npm run build     # ESM + CJS + types
npm run size      # bundle report
```

### Playground

A local harness that runs the **built** bundle — the same files `npm publish`
uploads — so you can smoke-test before releasing.

```bash
npm run playground     # builds, then serves on http://localhost:5180
```

It renders two independent components reading the hook, four themes including
two custom ones, and a live view of storage and the DOM. Seven manual checks
are listed on the page. The one worth doing every time: disable JavaScript in
DevTools, reload, and confirm the theme still applies — that proves the
pre-paint script works.

### Upgrading a v1 checkout

v2 replaced v1's JavaScript source with TypeScript. If the old files are still
present, Vite resolves `.js` before `.ts` and silently loads v1 instead:

```bash
rm -f src/index.js src/useTheme.js src/ThemeProvider.js tests/useTheme.test.js
```

`npm test` refuses to run while any of them exist.

---

## 📄 License

MIT © [Saad Ahmad](https://github.com/saadahmad888)

## 🔗 Links

- npm: https://www.npmjs.com/package/use-theme-mode
- GitHub: https://github.com/saadahmad888/use-theme-mode
- Live demo: https://use-theme-mode-demo.vercel.app/
