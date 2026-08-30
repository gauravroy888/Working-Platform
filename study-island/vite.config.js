import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist-react",
    emptyOutDir: true,
  },
  server: {
    port: 3002,
    strictPort: true,
    open: false,
  },
  // Tell Vite to use index.react.html as the entry (keep index.html vanilla)
  root: ".",
  publicDir: "assets",
  resolve: {
    alias: {
      "@": path.resolve("src"),
    },
  },
});
