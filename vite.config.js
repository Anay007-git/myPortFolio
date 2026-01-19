import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Open to local network and display URL
    open: true, // Open automatically
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }
})
