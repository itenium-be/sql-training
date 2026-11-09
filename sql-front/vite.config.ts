import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Behind the dev nginx the HMR websocket can't share the page's :80 origin,
// so the browser connects straight to the published vite port instead.
const hmrClientPort = process.env.VITE_HMR_CLIENT_PORT

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: Number(process.env.VITE_PORT) || 5173,
    ...(hmrClientPort ? { hmr: { clientPort: Number(hmrClientPort) } } : {}),
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
