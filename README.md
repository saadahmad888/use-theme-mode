
# use-theme-mode 🌗


[![npm version](https://img.shields.io/npm/v/use-theme-mode.svg)](https://www.npmjs.com/package/use-theme-mode)
[![npm downloads](https://img.shields.io/npm/dm/use-theme-mode.svg)](https://www.npmjs.com/package/use-theme-mode)
[![license](https://img.shields.io/npm/l/use-theme-mode.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://use-theme-mode-demo.vercel.app/)


A lightweight, framework-agnostic React hook for managing **light and dark theme modes** with persistence and system preference detection.

`use-theme-mode` focuses purely on **theme state management**, leaving styling completely in your control—making it compatible with any CSS solution or UI framework.

---

### ✨ Improvements
- Added live demo deployed on Vercel
- Added homepage link to npm package
- Improved README with usage examples and styling guides
---
### 🛠 Maintenance
- Cleaned up package metadata
- Improved documentation structure


---

## 🔗 Live Demo

Try the live demo here:

👉 https://use-theme-mode-demo.vercel.app/

The demo showcases:
- Real light/dark theme switching
- Persistent theme state
- Code example synced with live behavior


---

## ✨ Key Features

* **Toggle Modes:** Simple light/dark theme switching.
* **System Preference:** Automatically detects `prefers-color-scheme`.
* **Persistent:** Saves user choice via `localStorage`.
* **Cross-Tab Sync:** Updates theme seamlessly across all open browser tabs.
* **SSR Safe:** Works reliably in Next.js and other server-rendered environments.
* **Framework Agnostic:** Use with Plain CSS, Tailwind, MUI, Chakra UI, etc.
* **Zero Dependencies:** Keep your bundle size minimal.

---

## 📦 Installation

Get started by adding the package to your project:

```bash
# npm
npm install use-theme-mode

# yarn
yarn add use-theme-mode
```

---

## 🚀 Basic Usage

Integrating the hook is straightforward. It automatically updates the `data-theme` attribute on your `<html>` element.

```jsx
import { useTheme } from "use-theme-mode";

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

---

## 🎨 Applying Theme Styles

This library **does not** inject styles. Instead, it acts as a controller that manages a `data-theme` attribute on the `<html>` element.

### 1. Plain CSS Example
```css
/* Define your tokens */
:root[data-theme="light"] {
  --bg-color: #ffffff;
  --text-color: #000000;
}

:root[data-theme="dark"] {
  --bg-color: #121212;
  --text-color: #ffffff;
}

/* Apply transitions for smooth switching */
body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### 2. Tailwind CSS Example
Configure your `tailwind.config.js` to recognize the data attribute:

```js
// tailwind.config.js
module.exports = {
  darkMode: ["attribute", "data-theme"],
};
```

You can then use standard Tailwind dark-mode classes:
```jsx
<div className="bg-white text-black dark:bg-black dark:text-white">
  Hello World
</div>
```

---

## 🧩 API Reference

The `useTheme()` hook returns the following:

| Property | Type | Description |
| :--- | :--- | :--- |
| `theme` | `"light" \| "dark"` | The current active theme. |
| `toggleTheme` | `() => void` | Toggles between light and dark. |
| `setLight` | `() => void` | Forces light mode. |
| `setDark` | `() => void` | Forces dark mode. |

---

## 🧠 How It Works
1.  **Initialize:** Checks `localStorage` for a saved preference.
2.  **Fallback:** If no local data exists, it reads the system's `prefers-color-scheme`.
3.  **Persist:** All manual updates are stored back to `localStorage`.
4.  **Sync:** Updates the `<html data-theme="...">` attribute globally and synchronizes across tabs via the `storage` event.

---

## 📋 Compatibility
* **React:** 16.8+
* **Environments:** CRA, Vite, Next.js, and general SSR.

---

## 🛣️ Roadmap

* 🚀 **Optional `ThemeProvider`** context wrapper for easier state sharing.
* 🛡️ **Improved TypeScript** support with more robust type definitions.
* 📦 **ESM build** support to modernize package compatibility.
* 🔑 **Custom storage key** support to allow overriding the default `localStorage` key.

---

## 📄 License
MIT © [Saad Ahmad](https://github.com/saadahmad888)

---

## 🔗 GitHub Repository:
https://github.com/saadahmad888/use-theme-mode