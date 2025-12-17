// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 导入全局样式
import './assets/styles/index.css'

// 禁用ServiceWorker注册
console.log('禁用ServiceWorker注册...')

// 处理移动端音频自动播放策略
const initAudioOnInteraction = () => {
  console.log('用户交互，准备初始化音频...')
}

// 等待用户交互后再初始化应用
const initializeApp = () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.mount('#app')
}

// 多种用户交互方式触发应用初始化
document.addEventListener('DOMContentLoaded', () => {
  // 立即初始化应用，但音频会在用户交互后加载
  initializeApp()
  
  // 添加用户交互监听器用于音频初始化
  document.addEventListener('touchstart', initAudioOnInteraction, { once: true, passive: true })
  document.addEventListener('click', initAudioOnInteraction, { once: true })
  
  // HBuilderX 5+ API 就绪事件
  if (window.plus) {
    document.addEventListener('plusready', function() {
      console.log('5+ API 就绪')
    })
  }
})