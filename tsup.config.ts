// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: "esm",
    target: "es6",
    shims: false,
    dts: true,
    clean: true,
    outDir: "dist",
    sourcemap: false,
    minify: true,
  },
]);