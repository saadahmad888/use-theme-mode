#!/usr/bin/env node
/**
 * Guards against a half-finished upgrade.
 *
 * If v1's JavaScript source is left sitting next to v2's TypeScript, Vite
 * resolves `../src` to `src/index.js` before `src/index.ts` (its default
 * extension order puts .js first), and you get confusing failures about
 * `require is not defined in ES module scope`.
 *
 * Runs automatically before `npm test` and before publishing.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const STALE = [
  "src/index.js",
  "src/useTheme.js",
  "src/ThemeProvider.js",
  "tests/useTheme.test.js",
];

const found = STALE.filter((file) => existsSync(join(root, file)));

if (found.length > 0) {
  const list = found.map((file) => `    ${file}`).join("\n");

  console.error(`
┌───────────────────────────────────────────────────────────────┐
│  Leftover v1 files detected                                   │
└───────────────────────────────────────────────────────────────┘

These are from version 1 and must be deleted. v2 replaced them with
TypeScript equivalents:

${list}

Delete them, then run this again.

  PowerShell:
    Remove-Item -Force ${found.join(", ")}

  macOS / Linux:
    rm -f ${found.join(" ")}

Why this matters: Vite resolves ".js" before ".ts", so a leftover
src/index.js shadows the new src/index.ts and the whole build loads v1.
`);

  process.exit(1);
}

const relRoot = relative(process.cwd(), root) || ".";
console.log(`✓ No stale v1 files in ${relRoot}`);
