import { build } from "esbuild";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const scenarios = [
  { name: "useTheme only", code: `export { useTheme } from "./dist/index.mjs";` },
  { name: "useTheme + ThemeProvider", code: `export { useTheme, ThemeProvider } from "./dist/index.mjs";` },
  { name: "themeScript only", code: `export { themeScript } from "./dist/index.mjs";` },
  { name: "everything", code: `export * from "./dist/index.mjs";` },
];

const dir = mkdtempSync(join(tmpdir(), "size-"));
const rows = [];

for (const s of scenarios) {
  const entry = join(dir, "entry.mjs");
  writeFileSync(entry, s.code.replaceAll("./dist", join(process.cwd(), "dist")));
  const out = await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: "esm",
    write: false,
    external: ["react", "react-dom"],
    treeShaking: true,
  });
  const bytes = out.outputFiles[0].contents;
  rows.push({
    scenario: s.name,
    min: bytes.length,
    gzip: gzipSync(bytes).length,
    brotli: brotliCompressSync(bytes).length,
  });
}

rmSync(dir, { recursive: true, force: true });

const pad = (v, n) => String(v).padEnd(n);
console.log("\n  " + pad("scenario", 26) + pad("min", 10) + pad("gzip", 10) + "brotli");
console.log("  " + "-".repeat(52));
for (const r of rows) {
  console.log("  " + pad(r.scenario, 26) + pad(r.min + " B", 10) + pad(r.gzip + " B", 10) + r.brotli + " B");
}
console.log("");
