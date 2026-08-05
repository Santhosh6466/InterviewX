import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes dev server on local network (e.g., http://192.168.x.x:5173) for mobile testing
    port: 5173,
  },
})

