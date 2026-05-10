import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
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
    ANALYZE: "false",
    VITE_BASE_PATH: "/",
    ...loadEnv(mode, process.cwd(), ""),
  };

  return {
    base: normalizeBasePath(env.VITE_BASE_PATH),
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return undefined;
            }

            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router") ||
              id.includes("/scheduler/")
            ) {
              return "react-vendor";
            }

            if (id.includes("/framer-motion/")) {
              return "motion-vendor";
            }

            if (id.includes("/@dnd-kit/")) {
              return "dnd-vendor";
            }

            if (
              id.includes("/@radix-ui/") ||
              id.includes("/lucide-react/") ||
              id.includes("/class-variance-authority/") ||
              id.includes("/clsx/") ||
              id.includes("/tailwind-merge/")
            ) {
              return "ui-vendor";
            }

            if (id.includes("/howler/")) {
              return "audio-vendor";
            }

            if (id.includes("/matter-js/")) {
              return "matter-vendor";
            }

            return undefined;
          },
        },
      },
    },
    plugins: [
      mdx(),
      react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
      process.env.ANALYZE === "true"
        ? visualizer({
            emitFile: true,
            filename: "bundle-stats.html",
            gzipSize: true,
            open: false,
          })
        : null,
    ].filter(Boolean),
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
