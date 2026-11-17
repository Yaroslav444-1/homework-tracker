import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' — относительные пути, чтобы сборка работала и в корне домена (Vercel, Cloudflare),
// и в подпапке репозитория на GitHub Pages (https://user.github.io/repo/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
