import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: '../API/wwwroot',
    chunkSizeWarningLimit: 1700,
    emptyOutDir: true // so each time we build it deletes the output directory and recreates it again
  },
  server:{
    port: 3000
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    mkcert()
  ],
})
