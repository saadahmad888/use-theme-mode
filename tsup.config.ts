import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
  sourcemap: true,
  target: "es2019",
  external: ["react", "react-dom"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".mjs" };
  },
});
