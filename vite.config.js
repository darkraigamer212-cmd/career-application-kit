import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "portfolio-src",
  base: "./",
  plugins: [react()],
  build: {
    outDir: "../portfolio",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "portfolio-src/index.html",
        links: "portfolio-src/links.html"
      }
    }
  }
});
