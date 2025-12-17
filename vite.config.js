// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 用于解析路径
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
export default defineConfig({
  // 指定项目根目录（默认为当前目录，通常不需更改）
  // root: process.cwd(), [3](@ref)

  // 插件配置：Vue 插件是必须的
  plugins: [vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: '宁静之声 - 白噪声专注应用',
        short_name: '宁静之声',
        description: '专业的白噪声混合器和专注计时器',
        theme_color: '#88c0d0',
        background_color: '#f8f5f2',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
  base: './',  // 这行很重要！
  // 模块解析配置
  resolve: {
    // 路径别名：非常重要，让导入文件更简洁
    alias: {
      '@': path.resolve(__dirname, './src'), // 将 @ 映射到 /src 目录
      // 你可以根据你的目录结构添加更多别名，例如：
      // '@components': path.resolve(__dirname, './src/components'),
      // '@assets': path.resolve(__dirname, './src/assets'),
      // '@utils': path.resolve(__dirname, './src/utils') [1,4](@ref)
    },
    // 导入时可省略的扩展名列表 [4](@ref)
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  // 开发服务器配置
  server: {
    port: 3000, // 设置开发服务器端口，例如 3000 [1](@ref)
    open: true, // 启动后自动在浏览器中打开应用 [1,4](@ref)
    host: '0.0.0.0', // 允许通过本地IP访问，便于手机等设备测试 [4](@ref)
    cors: true, // 启用跨域资源共享 [4](@ref)
    // 配置代理规则，解决API跨域问题（如果需要连接后端API）[1,3](@ref)
    /* proxy: {
      '/api': {
        target: 'http://your-api-domain.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    } */
  },

  // 生产构建配置
  build: {
    outDir: 'dist', // 指定打包输出目录 [1,5](@ref)
    assetsDir: 'assets', // 指定静态资源（如图片、字体）的存放目录 [1,5](@ref)
    sourcemap: false, // 是否生成 source map 文件（生产环境通常关闭）[4](@ref)
    // 设置构建目标浏览器版本 [4](@ref)
    target: 'es2015',
    // 大于指定大小的 chunk 会触发警告（单位 kB）[4](@ref)
    chunkSizeWarningLimit: 2000
  }
})