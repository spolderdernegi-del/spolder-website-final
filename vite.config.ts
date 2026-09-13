import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Increase chunk size warning threshold (in kB)
    chunkSizeWarningLimit: 1500,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    // Production'da console.log/error/warn'ları kaldır
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
