import { defineConfig, loadEnv } from "vite";
import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import path from "node:path";

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
  };
});
