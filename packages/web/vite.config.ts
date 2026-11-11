import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // base relativa: o desktop (Electron) carrega o dist por file://
  base: './',
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    proxy: { '/api': 'http://localhost:3002' },
  }
})
