import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Necesario para la recarga en caliente dentro de Docker
    watch: process.env.CHOKIDAR_USEPOLLING ? { usePolling: true } : undefined,
  },
})
