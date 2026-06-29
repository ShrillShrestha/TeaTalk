import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Change '/TeaTalk/' to match your GitHub repo name if different
  base: '/TeaTalk/',
})
