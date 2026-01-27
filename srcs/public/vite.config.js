import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client")
    }
  },
  optimizeDeps: {
    include: [
      "@babylonjs/core",
      "@babylonjs/gui",
      "@babylonjs/gui/2D"
    ]
  },
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
