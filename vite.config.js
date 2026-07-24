import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Относительные пути, чтобы работало на GitHub Pages с любым именем репозитория
})
