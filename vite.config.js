import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/routes/index.jsx',
        './src/layouts/DashboardLayout.jsx',
      ],
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('lucide-react') || id.includes('@tailgrids/icons')) {
            return 'vendor-icons'
          }

          if (id.includes('recharts')) {
            return 'vendor-chart'
          }

          if (id.includes('@tanstack') || id.includes('axios')) {
            return 'vendor-query'
          }

          if (id.includes('react-hook-form') || id.includes('sweetalert2') || id.includes('zustand')) {
            return 'vendor-form'
          }

          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) {
            return 'vendor-react'
          }

          return 'vendor-misc'
        },
      },
    },
  },
})
