import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  // Use relative base so assets work both locally and on GitHub Pages
  base: "./",
  build: {
    // Build to dist-react; deploy script copies to study-island/
    outDir: "dist-react",
    emptyOutDir: true,
  },
  server: {
    port: 3002,
    strictPort: true,
    open: false,
    fs: {
      allow: [".."],
    },
  },
  root: ".",
  publicDir: "public",
  resolve: {
    alias: {
      "@": path.resolve("src"),
    },
  },
});
