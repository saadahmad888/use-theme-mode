import { createRoot } from "react-dom/client";
import { useSyncExternalStore, useCallback } from "react";
import { ThemeProvider, useTheme } from "use-theme-mode";
import { playgroundOptions } from "./options.mjs";

/**
 * Two separate components both calling useTheme(). If they ever disagree,
 * the shared store is broken — that was the worst bug in v1.
 */
function Readout({ title }) {
  const { theme, resolvedTheme, systemTheme, colorScheme, isDark, mounted } =
    useTheme();

  return (
    <div className="card">
      <strong style={{ fontSize: 13 }}>{title}</strong>
      <dl style={{ marginTop: 10 }}>
        <dt>theme</dt>
        <dd>{JSON.stringify(theme)}</dd>
        <dt>resolvedTheme</dt>
        <dd>{JSON.stringify(resolvedTheme)}</dd>
        <dt>systemTheme</dt>
        <dd>{JSON.stringify(systemTheme)}</dd>
        <dt>colorScheme</dt>
        <dd>{JSON.stringify(colorScheme)}</dd>
        <dt>isDark</dt>
        <dd>{String(isDark)}</dd>
        <dt>mounted</dt>
        <dd>{String(mounted)}</dd>
      </dl>
    </div>
  );
}

function Controls() {
  const { theme, themes, setTheme, toggleTheme, resetTheme } = useTheme();

  return (
    <div className="row">
      {themes.map((name) => (
        <button
          key={name}
          type="button"
          aria-pressed={theme === name}
          onClick={() => setTheme(name)}
        >
          {name}
        </button>
      ))}
      <button type="button" onClick={() => toggleTheme()}>
        toggleTheme()
      </button>
      <button type="button" onClick={resetTheme}>
        resetTheme()
      </button>
    </div>
  );
}

function StorageView() {
  const { theme } = useTheme();

  const subscribe = useCallback((notify) => {
    window.addEventListener("storage", notify);
    return () => window.removeEventListener("storage", notify);
  }, []);

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(playgroundOptions.storageKey);
    } catch {
      return null;
    }
  }, []);

  const stored = useSyncExternalStore(subscribe, getSnapshot, () => null);

  return (
    <div className="card">
      <strong style={{ fontSize: 13 }}>What is on the DOM and in storage</strong>
      <dl style={{ marginTop: 10 }}>
        <dt>localStorage</dt>
        <dd>{stored === null ? "(not set)" : JSON.stringify(stored)}</dd>
        <dt>data-theme</dt>
        <dd>
          {JSON.stringify(
            document.documentElement.getAttribute("data-theme")
          )}
        </dd>
        <dt>color-scheme</dt>
        <dd>{JSON.stringify(document.documentElement.style.colorScheme)}</dd>
        <dt>agreement</dt>
        <dd className="pass">
          {theme ? "both components read the same store" : "…"}
        </dd>
      </dl>
    </div>
  );
}

function Playground() {
  return (
    <main>
      <h1>use-theme-mode — local playground</h1>
      <p>
        Running the built <code>dist/</code> bundle, not the source. This is the
        exact artifact <code>npm publish</code> uploads.
      </p>

      <h2>Controls</h2>
      <Controls />

      <h2>Two independent components</h2>
      <div className="grid">
        <Readout title="Component A" />
        <Readout title="Component B" />
      </div>

      <h2>State</h2>
      <StorageView />

      <h2>Checks to run by hand</h2>
      <ol>
        <li>
          Click every theme button. The page recolours, <code>data-theme</code>{" "}
          changes, and both components stay identical.
        </li>
        <li>
          Pick <code>system</code>, then change your OS appearance. Values move
          with no reload. <em>This was broken in v1.</em>
        </li>
        <li>
          Pick <code>forest</code>. <code>colorScheme</code> reads{" "}
          <code>"dark"</code>, so native scrollbars go dark for a custom theme.
        </li>
        <li>
          Set a theme, then reload. It survives, with no flash of the wrong
          colour.
        </li>
        <li>
          Open DevTools → <kbd>Settings</kbd> → Debugger →{" "}
          <strong>Disable JavaScript</strong>, then reload. The page still comes
          up in the right theme, because the pre-paint script did it.
        </li>
        <li>
          Open this URL in a second tab. Change the theme in one; the other
          follows within a moment.
        </li>
        <li>
          Run <code>toggleTheme()</code> five times. It cycles all four themes
          and wraps around.
        </li>
      </ol>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <ThemeProvider {...playgroundOptions}>
    <Playground />
  </ThemeProvider>
);
