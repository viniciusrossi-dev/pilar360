import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        projeto: resolve(__dirname, 'projeto.html'),
        blog: resolve(__dirname, 'blog.html'),
        post: resolve(__dirname, 'post.html'),
        'admin/index': resolve(__dirname, 'admin/index.html'),
        'admin/dashboard': resolve(__dirname, 'admin/dashboard.html'),
        'admin/projetos': resolve(__dirname, 'admin/projetos.html'),
        'admin/blog': resolve(__dirname, 'admin/blog.html'),
      },
    },
  },
})
