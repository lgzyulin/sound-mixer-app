<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useSoundMixer } from './composables/useSoundMixer'
import SoundCard from './components/SoundCard.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

// 初始化音频管理器
const {
  sounds,
  isPlaying,
  globalVolume,
  isLoading,
  error,
  loadProgress,
  loadedSoundsCount,
  toggleSound,
  setVolume,
  toggleAllSounds,
  preloadSounds,
  loadTestAudio,
  cleanup
} = useSoundMixer()

// 加载状态
const isInitializing = ref(true)
const loadTimeoutRef = ref(null)

// 初始化加载
const initializeApp = async () => {
  console.log('应用初始化...')
  isInitializing.value = true
  
  try {
    // 先尝试加载一个测试音频
    console.log('测试音频加载...')
    const testLoaded = await loadTestAudio()
    
    if (!testLoaded) {
      console.warn('测试音频加载失败，检查文件路径')
      error.value = '音频文件可能不存在，请检查 public/sounds/ 目录'
      return
    }
    
    // 如果测试成功，加载所有音频
    console.log('开始加载所有音频...')
    await preloadSounds()
    
  } catch (err) {
    console.error('应用初始化失败:', err)
    error.value = `初始化失败: ${err.message}`
  } finally {
    isInitializing.value = false
    console.log('应用初始化完成')
  }
}

// 设置加载超时
const setupLoadTimeout = () => {
  clearTimeout(loadTimeoutRef.value)
  loadTimeoutRef.value = setTimeout(() => {
    if (isLoading.value) {
      console.warn('音频加载超时')
      error.value = '音频加载超时，请检查网络连接或刷新页面'
      isLoading.value = false
    }
  }, 15000) // 15秒超时
}

// 组件挂载
onMounted(async () => {
  console.log('App.vue 挂载')
  setupLoadTimeout()
  await initializeApp()
})

// 组件卸载
onUnmounted(() => {
  console.log('App.vue 卸载')
  clearTimeout(loadTimeoutRef.value)
  cleanup()
})

// 监听错误状态
watch(error, (newError) => {
  if (newError) {
    console.error('应用错误:', newError)
  }
})

// 监听加载状态
watch(isLoading, (loading) => {
  console.log('加载状态:', loading ? '加载中' : '加载完成')
})

// 手动重试加载
const retryLoad = async () => {
  error.value = null
  await initializeApp()
}
</script>

<template>
  <div class="app">
    <!-- 初始化加载 -->
    <div v-if="isInitializing" class="loading-container">
      <div class="loading-animation">
        <div class="loading-dots">
          <div class="dot" style="--delay: 0s; --color: #4facfe"></div>
          <div class="dot" style="--delay: 0.1s; --color: #00f2fe"></div>
          <div class="dot" style="--delay: 0.2s; --color: #667eea"></div>
          <div class="dot" style="--delay: 0.3s; --color: #764ba2"></div>
        </div>
        <p class="loading-text">正在加载音频...</p>
        <p class="loading-subtext">初始化应用程序</p>
      </div>
    </div>

    <!-- 音频加载中 -->
    <LoadingSpinner v-else-if="isLoading" :progress="loadProgress" />

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p class="error-message">{{ error }}</p>
        <div class="error-details">
          <p>已加载音频: {{ loadedSoundsCount }} / {{ sounds.length }}</p>
          <p>请检查以下事项：</p>
          <ul>
            <li>public/sounds/ 目录下是否有音频文件</li>
            <li>音频文件名是否正确（rain.mp3, waves.mp3等）</li>
            <li>控制台是否有错误信息</li>
          </ul>
        </div>
        <button class="retry-btn" @click="retryLoad">🔄 重新加载</button>
        <button class="skip-btn" @click="isLoading = false; error = null">
          ⏭️ 跳过音频加载
        </button>
      </div>
    </div>

    <!-- 主界面 -->
    <div v-else class="sound-mixer">
      <header class="app-header">
        <h1>宁静之声 - 专业的白噪声混合器</h1>
        <p class="app-subtitle">放松、专注、助眠</p>
        
        <div class="global-controls">
          <button 
            class="play-all-btn"
            :class="{ active: isPlaying }"
            @click="toggleAllSounds"
          >
            {{ isPlaying ? '⏸️ 暂停所有' : '▶️ 播放所有' }}
          </button>
          
          <div class="volume-control">
            <span>🔈 全局音量</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="globalVolume"
              @input="setVolume({ volume: parseFloat($event.target.value) })"
              class="volume-slider"
            />
            <span class="volume-value">{{ Math.round(globalVolume * 100) }}%</span>
          </div>
        </div>
        
        <div class="audio-info">
          <span>已加载: {{ loadedSoundsCount }}/{{ sounds.length }} 个音频</span>
          <span v-if="error" class="warning">⚠️ 部分音频加载失败</span>
        </div>
      </header>

      <main class="sound-grid">
        <SoundCard
          v-for="sound in sounds"
          :key="sound.id"
          :sound="sound"
          @toggle="toggleSound"
          @volume-change="setVolume"
        />
      </main>

      <footer class="app-footer">
        <p>使用空格键控制播放/暂停 | 使用方向键调整音量</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* 初始化加载样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.loading-animation {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
}

.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--color);
  animation: bounce 1.4s infinite var(--delay);
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-20px);
  }
}

.loading-text {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 10px;
  color: white;
  letter-spacing: 2px;
}

.loading-subtext {
  font-size: 0.9rem;
  opacity: 0.7;
  color: rgba(255, 255, 255, 0.7);
}

/* 错误提示样式 */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.error-content {
  max-width: 500px;
  padding: 40px;
  background: rgba(255, 87, 87, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 87, 87, 0.3);
  text-align: center;
  backdrop-filter: blur(10px);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-content h3 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #ff4757;
}

.error-message {
  background: rgba(255, 71, 87, 0.2);
  padding: 12px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 1rem;
}

.error-details {
  text-align: left;
  margin: 20px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  font-size: 0.9rem;
  line-height: 1.6;
}

.error-details ul {
  margin: 10px 0 0 20px;
  padding: 0;
}

.error-details li {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
}

.retry-btn, .skip-btn {
  margin: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.retry-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.skip-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.retry-btn:hover, .skip-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* 主界面样式 */
.sound-mixer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.7);
}

.global-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.play-all-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 180px;
}

.play-all-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.play-all-btn.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
  border-radius: 20px;
  min-width: 300px;
}

.volume-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 2px solid #4facfe;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.volume-value {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
}

.audio-info {
  margin-top: 20px;
  font-size: 0.9rem;
  opacity: 0.7;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.warning {
  color: #ffcc00;
}

.sound-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.app-footer {
  text-align: center;
  padding: 20px;
  font-size: 0.9rem;
  opacity: 0.6;
  color: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }
  
  .global-controls {
    width: 100%;
  }
  
  .volume-control {
    min-width: auto;
    width: 100%;
  }
  
  .sound-grid {
    grid-template-columns: 1fr;
  }
  
  .error-content {
    padding: 20px;
    margin: 20px;
  }
}
</style>