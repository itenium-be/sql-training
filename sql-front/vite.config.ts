import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        rewrite: path => path.replace(/^\/api/, ''),
      },
      '/leaderboard': {
        target: 'http://localhost:8000',
        rewrite: path => path.replace(/^\/leaderboard/, ''),
      },
    },
  },
})
