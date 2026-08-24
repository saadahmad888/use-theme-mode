import { describe, expect, it } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { ThemeProvider, ThemeScript, themeScript, useTheme } from "../src";
import { setSystemDark } from "./setup";

const root = () => document.documentElement;

describe("useTheme — defaults", () => {
  it("follows the system preference when nothing is stored", () => {
    setSystemDark(true);
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("system");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(result.current.isDark).toBe(true);
    expect(root().getAttribute("data-theme")).toBe("dark");
  });

  it("writes the native color scheme so browser UI matches", () => {
    setSystemDark(true);
    renderHook(() => useTheme());
    expect(root().style.colorScheme).toBe("dark");
  });

  it("toggles between light and dark", () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setLight());
    expect(result.current.theme).toBe("light");

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("dark");
    expect(root().getAttribute("data-theme")).toBe("dark");

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
  });

  it("persists the choice to localStorage", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setDark());
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("accepts an updater function", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("light"));
    act(() =>
      result.current.setTheme((current) =>
        current === "light" ? "dark" : "light"
      )
    );
    expect(result.current.theme).toBe("dark");
  });

  it("ignores unknown themes instead of corrupting state", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("light"));
    act(() => result.current.setTheme("banana"));
    expect(result.current.theme).toBe("light");
  });

  it("resets back to the default", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setDark());
    act(() => result.current.resetTheme());

    expect(result.current.theme).toBe("system");
    expect(localStorage.getItem("theme")).toBeNull();
  });
});

describe("shared state (v1 regression)", () => {
  it("keeps every call site in sync", () => {
    function Readout({ id }: { id: string }) {
      const { theme } = useTheme();
      return <span data-testid={id}>{theme}</span>;
    }

    function Switcher() {
      const { setDark } = useTheme();
      return (
        <button onClick={setDark} type="button">
          dark
        </button>
      );
    }

    render(
      <>
        <Readout id="a" />
        <Readout id="b" />
        <Switcher />
      </>
    );

    act(() => screen.getByRole("button").click());

    expect(screen.getByTestId("a").textContent).toBe("dark");
    expect(screen.getByTestId("b").textContent).toBe("dark");
  });
});

describe("system theme tracking (v1 regression)", () => {
  it("reacts to OS changes while on system", () => {
    setSystemDark(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolvedTheme).toBe("light");

    act(() => setSystemDark(true));

    expect(result.current.resolvedTheme).toBe("dark");
    expect(root().getAttribute("data-theme")).toBe("dark");
  });

  it("ignores OS changes once a theme is pinned", () => {
    setSystemDark(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setLight());

    act(() => setSystemDark(true));

    expect(result.current.resolvedTheme).toBe("light");
    expect(result.current.systemTheme).toBe("dark");
  });
});

describe("cross-tab sync", () => {
  it("adopts a value written by another tab", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "theme", newValue: "dark" })
      );
    });

    expect(result.current.theme).toBe("dark");
  });

  it("falls back to the default when another tab clears storage", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setDark());

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "theme", newValue: null })
      );
    });

    expect(result.current.theme).toBe("system");
  });
});

describe("ThemeProvider configuration", () => {
  const wrapper = (props: Record<string, unknown>) =>
    function Wrapper({ children }: { children: React.ReactNode }) {
      return <ThemeProvider {...props}>{children}</ThemeProvider>;
    };

  it("supports custom themes and cycles through all of them", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({
        themes: ["light", "dark", "sepia"],
        defaultTheme: "light",
        enableSystem: false,
      }),
    });

    expect(result.current.themes).toEqual(["light", "dark", "sepia"]);

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("dark");

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("sepia");
    expect(root().getAttribute("data-theme")).toBe("sepia");

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
  });

  it("maps custom themes to a native color scheme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({
        themes: ["light", "dark", "nord"],
        defaultTheme: "nord",
        enableSystem: false,
        colorSchemes: { nord: "dark" },
      }),
    });

    expect(result.current.isDark).toBe(true);
    expect(root().style.colorScheme).toBe("dark");
  });

  it("writes a class instead of an attribute for Tailwind", () => {
    renderHook(() => useTheme(), {
      wrapper: wrapper({
        attribute: "class",
        defaultTheme: "dark",
        enableSystem: false,
      }),
    });

    expect(root().classList.contains("dark")).toBe(true);
    expect(root().classList.contains("light")).toBe(false);
  });

  it("writes multiple attributes at once", () => {
    renderHook(() => useTheme(), {
      wrapper: wrapper({
        attribute: ["class", "data-theme"],
        defaultTheme: "dark",
        enableSystem: false,
      }),
    });

    expect(root().classList.contains("dark")).toBe(true);
    expect(root().getAttribute("data-theme")).toBe("dark");
  });

  it("honours a custom storage key", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({ storageKey: "app-theme" }),
    });

    act(() => result.current.setDark());
    expect(localStorage.getItem("app-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("can use sessionStorage", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({ storage: "session" }),
    });

    act(() => result.current.setDark());
    expect(sessionStorage.getItem("theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("persists nothing when storage is disabled", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({ storage: "none" }),
    });

    act(() => result.current.setDark());
    expect(result.current.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("locks the page to a forced theme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({ forcedTheme: "light" }),
    });

    act(() => result.current.setDark());

    expect(result.current.resolvedTheme).toBe("light");
    expect(root().getAttribute("data-theme")).toBe("light");
  });

  it("remaps attribute values", () => {
    renderHook(() => useTheme(), {
      wrapper: wrapper({
        defaultTheme: "dark",
        enableSystem: false,
        value: { dark: "theme-dark" },
      }),
    });

    expect(root().getAttribute("data-theme")).toBe("theme-dark");
  });

  it("reports an onChange for every applied theme", () => {
    const seen: string[] = [];
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({
        enableSystem: false,
        defaultTheme: "light",
        onChange: (_t: string, resolved: string) => seen.push(resolved),
      }),
    });

    act(() => result.current.setDark());
    expect(seen).toContain("dark");
  });
});

describe("no-flash script", () => {
  it("produces a self-contained expression", () => {
    const code = themeScript({ storageKey: "theme" });
    expect(code.startsWith("!function")).toBe(true);
    expect(code).toContain("prefers-color-scheme");
    expect(() => new Function(code)).not.toThrow();
  });

  it("applies the stored theme when executed before React", () => {
    localStorage.setItem("theme", "dark");
    new Function(themeScript())();
    expect(root().getAttribute("data-theme")).toBe("dark");
  });

  it("renders as a script tag", () => {
    const { container } = render(<ThemeScript nonce="abc123" />);
    const tag = container.querySelector("script");
    expect(tag).not.toBeNull();
    expect(tag?.innerHTML).toContain("prefers-color-scheme");
  });

  it("stays small enough to inline in every response", () => {
    expect(themeScript().length).toBeLessThan(900);
  });
});

describe("resilience", () => {
  it("survives storage access being blocked", () => {
    const original = Object.getOwnPropertyDescriptor(
      window,
      "localStorage"
    );

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("SecurityError");
      },
    });

    expect(() => {
      const { result } = renderHook(() => useTheme());
      act(() => result.current.setDark());
    }).not.toThrow();

    if (original) Object.defineProperty(window, "localStorage", original);
  });

  it("ignores a corrupted stored value", () => {
    localStorage.setItem("theme", "<script>alert(1)</script>");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
  });
});
