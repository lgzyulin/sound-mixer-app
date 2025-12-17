// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  
  // 模块解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
    cors: true,
  },

  // 生产构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2015',
    chunkSizeWarningLimit: 2000,
    
    // 确保静态资源正确复制
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
})