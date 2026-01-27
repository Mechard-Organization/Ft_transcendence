import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: [
      "@babylonjs/core",
      "@babylonjs/gui",
      "@babylonjs/gui/2D"
    ]
  },
  root: ".",
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: [
      "ft-transcendence-42.app",
      "www.ft-transcendence-42.app",
      "localhost"
    ],
  },
});
