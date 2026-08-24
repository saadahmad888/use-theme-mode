import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { __resetStore } from "../src/store";

/** jsdom ships no matchMedia — provide a controllable stub. */
let listeners: Array<(e: MediaQueryListEvent) => void> = [];
let prefersDark = false;

export function setSystemDark(value: boolean) {
  prefersDark = value;
  const event = { matches: value, media: "" } as MediaQueryListEvent;
  listeners.forEach((fn) => fn(event));
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: prefersDark,
    media: query,
    onchange: null,
    addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
      listeners.push(fn);
    },
    removeEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
      listeners = listeners.filter((l) => l !== fn);
    },
    addListener: (fn: (e: MediaQueryListEvent) => void) => listeners.push(fn),
    removeListener: (fn: (e: MediaQueryListEvent) => void) => {
      listeners = listeners.filter((l) => l !== fn);
    },
    dispatchEvent: () => false,
  })),
});

afterEach(() => {
  cleanup();
  __resetStore();
  localStorage.clear();
  sessionStorage.clear();
  listeners = [];
  prefersDark = false;
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("class");
  document.documentElement.style.colorScheme = "";
});
