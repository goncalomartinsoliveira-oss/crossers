import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        grunge: resolve(__dirname, 'grunge/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        'blog-o-que-e-o-crossers': resolve(__dirname, 'blog/o-que-e-o-crossers/index.html'),
        'blog-atletas-hybrid-racing': resolve(__dirname, 'blog/atletas-hybrid-racing/index.html'),
      },
    },
  },
})
