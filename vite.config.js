import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    extensions: ['.jsx', '.js', '.ts', '.tsx', '.mjs', '.json']
  },
  plugins: [react()],
  build: {
    outDir: 'build'
  }
})