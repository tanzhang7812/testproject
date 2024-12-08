import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Proxying websockets or socket.io
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  },
  build:{
    outDir:'../build/resources/main/static'
  },
  css:{
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
        }
      }
    }
  }
})
