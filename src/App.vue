<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useSoundMixer } from './composables/useSoundMixer'
import { useTimer } from './composables/useTimer'
import SoundCard from './components/SoundCard.vue'
import TimerRing from './components/TimerRing.vue'

// 初始化音频管理器
const {
  sounds,
  isPlaying,
  globalVolume,
  isLoading,
  error,
  loadedSoundsCount,
  toggleSound,
  setVolume,
  toggleAllSounds,
  preloadSounds,
  playAll,
  pauseAll,
  cleanup
} = useSoundMixer()

// 初始化计时器
const {
  timerMode,
  timerDuration,
  timeLeft,
  isTimerRunning,
  progressPercentage,
  strokeDashoffset,
  circumference,
  formattedTimeLeft,
  formattedDuration,
  setTimerDuration,
  setTimerByPercentage,
  setPresetTime,
  startTimer,
  pauseTimer,
  stopTimer,
  resetTimer,
  toggleTimerMode,
  toggleTimer
} = useTimer()

// 音频与计时器联动
watch(isTimerRunning, (running) => {
  if (running) {
    // 计时器开始时，确保有至少一个音频在播放
    if (!isPlaying.value) {
      // 默认播放前两个音效
      if (sounds.value.length >= 2) {
        toggleSound(sounds.value[0].id)
        toggleSound(sounds.value[1].id)
      } else if (sounds.value.length > 0) {
        toggleSound(sounds.value[0].id)
      }
    }
  } else {
    // 计时器暂停时，不暂停音频，让用户自己控制
  }
})

// 计时器结束事件
if (typeof window !== 'undefined') {
  window.addEventListener('timer-finished', () => {
    // 计时结束时暂停所有音频
    sounds.value.forEach(sound => {
      if (sound.isActive) {
        toggleSound(sound.id)
      }
    })
    
    // 可以添加通知
    if (Notification.permission === 'granted') {
      new Notification('番茄计时器', {
        body: '计时结束！',
        icon: '/favicon.ico'
      })
    }
  })
}

// 处理计时器模式切换
const handleModeChange = (mode) => {
  if (timerMode.value !== mode) {
    toggleTimerMode()
  }
}

// 处理预设时间
const handlePresetTime = (minutes) => {
  setPresetTime(minutes)
  if (isTimerRunning.value) {
    stopTimer()
  }
}

// 处理圆环拖动
const handleTimeChange = (percentage) => {
  setTimerByPercentage(percentage)
  if (isTimerRunning.value) {
    stopTimer()
  }
}

// 初始化应用
const initializeApp = async () => {
  try {
    await preloadSounds()
  } catch (err) {
    console.error('音频加载失败:', err)
  }
}

// 组件挂载
onMounted(async () => {
  await initializeApp()
  
  // 请求通知权限
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

// 组件卸载
onUnmounted(() => {
  cleanup()
  if (typeof window !== 'undefined') {
    window.removeEventListener('timer-finished', () => {})
  }
})
</script>

<template>
  <div class="app">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-animation">
        <div class="loading-dots">
          <div class="dot" style="--delay: 0s; --color: #4facfe"></div>
          <div class="dot" style="--delay: 0.1s; --color: #00f2fe"></div>
          <div class="dot" style="--delay: 0.2s; --color: #667eea"></div>
          <div class="dot" style="--delay: 0.3s; --color: #764ba2"></div>
        </div>
        <p class="loading-text">正在加载音频...</p>
        <p class="loading-subtext">已加载 {{ loadedSoundsCount }}/6 个音频</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="initializeApp">🔄 重新加载</button>
      </div>
    </div>

    <!-- 主界面 -->
    <div v-else class="sound-mixer">
      <header class="app-header">
        <h1>宁静之声 - 专业的白噪音混合器</h1>
        <p class="app-subtitle">放松、专注、助眠 | 番茄计时器专注工作法</p>
        
        <!-- 计时器状态 -->
        <div class="timer-status">
          <span class="timer-mode-badge" :class="timerMode">
            {{ timerMode === 'infinite' ? '无限循环模式' : '倒计时模式' }}
          </span>
          <span v-if="timerMode === 'countdown'" class="timer-duration">
            设定: {{ formattedDuration }}
          </span>
        </div>
      </header>

      <main class="main-content">
        <!-- 左侧 - 计时器控制 -->
        <div class="timer-section">
          <TimerRing
            :timer-mode="timerMode"
            :progress-percentage="progressPercentage"
            :formatted-time-left="formattedTimeLeft"
            :timer-duration="timerDuration"
            :is-timer-running="isTimerRunning"
            :circumference="circumference"
            :stroke-dashoffset="strokeDashoffset"
            @time-change="handleTimeChange"
            @toggle="toggleTimer"
            @stop="stopTimer"
            @preset="handlePresetTime"
            @mode-change="handleModeChange"
          />
          
          <!-- 计时器说明 -->
          <div class="timer-instructions">
            <h3>使用方法：</h3>
            <ul>
              <li><strong>无限循环模式</strong>：音频持续播放直到手动停止</li>
              <li><strong>倒计时模式</strong>：拖动圆环设置时间，最长2小时</li>
              <li>点击预设时间快速设置常用时长</li>
              <li>计时结束后音频会自动停止</li>
            </ul>
          </div>
        </div>

        <!-- 右侧 - 音频控制 -->
        <div class="audio-section">
          <!-- 全局控制 -->
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
          
          <!-- 音频信息 -->
          <div class="audio-info">
            <span>已加载音频: {{ loadedSoundsCount }}/6</span>
            <span v-if="timerMode === 'countdown'" class="timer-info">
              计时器: {{ isTimerRunning ? '运行中' : '已暂停' }} - {{ formattedTimeLeft }}
            </span>
          </div>

          <!-- 音效网格 -->
          <div class="sound-grid">
            <SoundCard
              v-for="sound in sounds"
              :key="sound.id"
              :sound="sound"
              @toggle="toggleSound"
              @volume-change="setVolume"
            />
          </div>
        </div>
      </main>

      <footer class="app-footer">
        <p>🎯 使用番茄工作法提高专注力 | 推荐设置25分钟工作 + 5分钟休息</p>
        <p class="footer-hint">提示：计时器运行时，音频会自动在计时结束时停止</p>
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

/* 加载状态 */
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

/* 错误提示 */
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

.retry-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* 主界面 */
.sound-mixer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
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
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.7);
}

.timer-status {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.timer-mode-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid #2196F3;
  color: #90CAF9;
}

.timer-mode-badge.countdown {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4CAF50;
  color: #A5D6A7;
}

.timer-duration {
  padding: 6px 12px;
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #FFC107;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #FFE082;
}

/* 主内容区 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  margin-bottom: 30px;
}

.timer-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timer-instructions {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timer-instructions h3 {
  margin-bottom: 10px;
  color: #4facfe;
  font-size: 1.2rem;
}

.timer-instructions ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.timer-instructions li {
  margin-bottom: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  padding-left: 20px;
  position: relative;
}

.timer-instructions li:before {
  content: '•';
  color: #4facfe;
  position: absolute;
  left: 0;
}

.audio-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 全局控制 */
.global-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  width: fit-content;
  align-self: center;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.timer-info {
  background: rgba(76, 175, 80, 0.2);
  padding: 6px 12px;
  border-radius: 15px;
  color: #A5D6A7;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

/* 音效网格 */
.sound-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* 页脚 */
.app-footer {
  text-align: center;
  padding: 20px;
  margin-top: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.app-footer p {
  margin-bottom: 10px;
}

.footer-hint {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .timer-section {
    order: 2;
  }
  
  .audio-section {
    order: 1;
  }
}

@media (max-width: 768px) {
  .app {
    padding: 10px;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .main-content {
    gap: 20px;
  }
  
  .sound-grid {
    grid-template-columns: 1fr;
  }
  
  .global-controls {
    padding: 15px;
  }
  
  .play-all-btn {
    width: 100%;
  }
  
  .volume-control {
    flex-direction: column;
    align-items: stretch;
  }
  
  .audio-info {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>