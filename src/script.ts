import type { ThemeConfig } from "./types";

/**
 * Build the tiny blocking script that paints the correct theme before the
 * browser's first paint. Nothing here depends on React, so it can be dropped
 * into any server-rendered document.
 *
 * ```ts
 * const html = `<script>${themeScript({ storageKey: "theme" })}</script>`;
 * ```
 */
export function themeScript(options: ThemeConfig = {}): string {
  const themes = options.themes ?? ["light", "dark"];
  const enableSystem = options.enableSystem ?? true;
  const defaultTheme =
    options.defaultTheme ?? (enableSystem ? "system" : themes[0] ?? "light");
  const storageKey = options.storageKey ?? "theme";
  const storage = options.storage ?? "local";
  const attributes = Array.isArray(options.attribute)
    ? options.attribute
    : [options.attribute ?? "data-theme"];
  const value = options.value ?? {};
  const colorSchemes = { light: "light", dark: "dark", ...options.colorSchemes };
  const enableColorScheme = options.enableColorScheme ?? true;
  const forcedTheme = options.forcedTheme ?? null;

  const args = [
    JSON.stringify(themes),
    JSON.stringify(defaultTheme),
    JSON.stringify(storageKey),
    JSON.stringify(attributes),
    JSON.stringify(value),
    JSON.stringify(colorSchemes),
    JSON.stringify(enableSystem),
    JSON.stringify(enableColorScheme),
    JSON.stringify(forcedTheme),
    JSON.stringify(storage),
  ].join(",");

  // Kept deliberately terse: this string ships in every HTML response.
  return `!function(o,d,k,a,v,c,s,e,f,g){try{var r=document.documentElement,t=f;if(!t){try{t=(g==="session"?sessionStorage:g==="none"?null:localStorage).getItem(k)}catch(_){}if(!t||(t!=="system"&&o.indexOf(t)<0))t=d}var m=t;if(t==="system"){m=s&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":s?"light":o[0]}var n=v[m]||m;for(var i=0;i<a.length;i++){if(a[i]==="class"){for(var j=0;j<o.length;j++)r.classList.remove(v[o[j]]||o[j]);r.classList.add(n)}else r.setAttribute(a[i],n)}if(e){r.style.colorScheme=c[m]||(m==="dark"?"dark":"light")}}catch(_){}}(${args})`;
}
