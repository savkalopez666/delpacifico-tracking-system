import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: "dist",

    rollupOptions: {
      input: {
        main: "index.html",
        widget: "src/widget.jsx"
      },

      output: {
        entryFileNames: (chunkInfo) => {
          // separa el widget del app normal
          if (chunkInfo.name === "widget") {
            return "widget.jsx";
          }
          return "assets/[name]-[hash].js";
        },

        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  },

  server: {
    port: 5173,
    open: true
  }
});