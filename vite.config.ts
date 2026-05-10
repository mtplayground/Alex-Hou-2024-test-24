import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

function normalizeBasePath(basePath: string) {
  if (basePath.trim().length === 0 || basePath === "/") {
    return "/";
  }

  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export default defineConfig(({ mode }) => {
  const env = {
    VITE_BASE_PATH: "/",
    ...loadEnv(mode, process.cwd(), ""),
  };

  return {
    base: normalizeBasePath(env.VITE_BASE_PATH),
    plugins: [mdx(), react({ include: /\.(mdx|js|jsx|ts|tsx)$/ })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      css: true,
      environment: "jsdom",
      restoreMocks: true,
      setupFiles: "./src/test/setup.ts",
    },
  };
});
