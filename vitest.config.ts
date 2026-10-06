import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  // PostCSS inline vuoto: evita che Vite cerchi postcss.config.mjs
  // (il cui plugin tailwind non si caricherebbe comunque nei test)
  css: { postcss: { plugins: [] } },
  test: {
    environment: "node",
    include: ["lib/__tests__/**/*.test.ts"],
  },
});
