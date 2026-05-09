import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [mdx(), react({ include: /\.(mdx|js|jsx|ts|tsx)$/ })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
