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
        'blog-ginasios-corrida-hibrida-lisboa': resolve(__dirname, 'blog/ginasios-corrida-hibrida-lisboa/index.html'),
        links: resolve(__dirname, 'links/index.html'),
        calendario: resolve(__dirname, 'calendario/index.html'),
        ginasios: resolve(__dirname, 'ginasios/index.html'),
        rulebook: resolve(__dirname, 'rulebook/index.html'),
        'blog-erros-preparacao-prova-hibrida': resolve(__dirname, 'blog/erros-preparacao-prova-hibrida/index.html'),
      },
    },
  },
})
