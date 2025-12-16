<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useSoundMixer } from './composables/useSoundMixer'
import { useTimer } from './composables/useTimer'
import SoundCard from './components/SoundCard.vue'

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

// 圆环拖动相关
const svgElement = ref(null)
const isDragging = ref(false)

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

// 处理圆环拖动 - 修复版本
const handleTimeChange = (percentage) => {
  setTimerByPercentage(percentage)
  if (isTimerRunning.value) {
    stopTimer()
  }
}

// 计算拖动点位置
const dragHandleStyle = computed(() => {
  if (timerMode.value === 'infinite') return {}
  
  const percentage = progressPercentage.value
  // 计算角度：0% = 顶部（-90度），100% = 同样顶部但一圈
  const angle = (percentage / 100) * 360 - 90
  
  // 转换为弧度
  const radians = (angle * Math.PI) / 180
  
  // SVG坐标系：中心点(50, 50)，半径45
  const x = 50 + 45 * Math.cos(radians)
  const y = 50 + 45 * Math.sin(radians)
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)'
  }
})

// 计算进度条颜色
const progressColor = computed(() => {
  const percentage = progressPercentage.value
  if (percentage > 50) return '#4CAF50' // 绿色
  if (percentage > 25) return '#FF9800' // 橙色
  return '#F44336' // 红色
})

// 开始拖动
const startDrag = (event) => {
  if (timerMode.value === 'infinite') return
  
  event.preventDefault()
  isDragging.value = true
  
  const handleMove = (moveEvent) => {
    if (!isDragging.value) return
    
    const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX)
    const clientY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY)
    
    if (clientX && clientY) {
      updateTime(clientX, clientY)
    }
  }
  
  const handleEnd = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('touchmove', handleMove, { passive: false })
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchend', handleEnd)
  
  // 立即更新一次（用于处理点击事件）
  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)
  
  if (clientX && clientY) {
    updateTime(clientX, clientY)
  }
}

// 更新时间
const updateTime = (clientX, clientY) => {
  if (!svgElement.value) return
  
  const rect = svgElement.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  
  const deltaX = clientX - centerX
  const deltaY = clientY - centerY
  
  // 计算角度（以3点钟方向为0度）
  let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
  
  // 转换为从顶部（12点钟方向）开始，顺时针增加
  // 数学角度：0度=3点钟，90度=6点钟，180度=9点钟，270度=12点钟
  // 我们想要：0度=12点钟，90度=3点钟，180度=6点钟，270度=9点钟
  angle += 90 // 从3点钟方向调整到12点钟方向
  
  // 确保角度在0-360度之间
  if (angle < 0) angle += 360
  if (angle >= 360) angle -= 360
  
  // 转换为百分比：顶部（12点钟方向）= 0%，顺时针增加到360° = 100%
  const percentage = angle / 360 * 100
  
  handleTimeChange(Math.max(0, Math.min(100, percentage)))
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
  
  // 防止文本选择
  document.addEventListener('selectstart', preventSelect)
})

// 组件卸载
onUnmounted(() => {
  cleanup()
  if (typeof window !== 'undefined') {
    window.removeEventListener('timer-finished', () => {})
  }
  document.removeEventListener('selectstart', preventSelect)
})

const preventSelect = (event) => {
  if (isDragging.value) {
    event.preventDefault()
  }
}
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
          <!-- 圆环进度条 -->
          <div class="timer-ring-container">
            <svg 
              ref="svgElement"
              width="200" 
              height="200" 
              viewBox="0 0 100 100"
              class="ring-svg"
            >
              <!-- 背景圆环 -->
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                stroke-width="8"
                class="ring-background"
              />
              
              <!-- 进度圆环 -->
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                :stroke="timerMode === 'infinite' ? '#4CAF50' : progressColor"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
                class="ring-progress"
                transform="rotate(-90 50 50)"
              />
              
              <!-- 时间显示 -->
              <text
                x="50"
                y="50"
                text-anchor="middle"
                dominant-baseline="middle"
                class="time-text"
              >
                {{ timerMode === 'infinite' ? '∞' : formattedTimeLeft }}
              </text>
              
              <!-- 模式指示 -->
              <text
                x="50"
                y="60"
                text-anchor="middle"
                dominant-baseline="middle"
                class="mode-text"
              >
                {{ timerMode === 'infinite' ? '无限循环' : '倒计时' }}
              </text>
            </svg>
            
            <!-- 拖动指示点（只在倒计时模式下显示） -->
            <div 
              v-if="timerMode === 'countdown'"
              class="drag-handle"
              :style="dragHandleStyle"
              @mousedown.stop="startDrag"
              @touchstart.stop="startDrag"
            >
              <div class="handle-dot"></div>
            </div>
          </div>
          
          <!-- 控制按钮区域 -->
          <div class="timer-controls">
            <!-- 模式切换按钮 -->
            <div class="mode-switch">
              <button 
                class="mode-btn infinite"
                :class="{ active: timerMode === 'infinite' }"
                @click="handleModeChange('infinite')"
              >
                ∞ 无限循环
              </button>
              <button 
                class="mode-btn countdown"
                :class="{ active: timerMode === 'countdown' }"
                @click="handleModeChange('countdown')"
              >
                ⏱️ 倒计时
              </button>
            </div>
            
            <!-- 根据模式显示不同的控制按钮 -->
            <div v-if="timerMode === 'infinite'" class="infinite-controls">
              <!-- 无限循环模式：只显示播放/暂停按钮 -->
              <button 
                class="timer-btn play-pause-btn infinite-play-btn"
                :class="{ paused: !isPlaying }"
                @click="toggleAllSounds"
              >
                {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
              </button>
            </div>
            
            <div v-else class="countdown-controls">
              <!-- 倒计时模式：显示计时器控制按钮 -->
              <div class="countdown-main-controls">
                <button 
                  class="timer-btn play-pause-btn"
                  :class="{ paused: !isTimerRunning }"
                  @click="toggleTimer"
                >
                  {{ isTimerRunning ? '⏸️ 暂停' : '▶️ 开始' }}
                </button>
                
                <button 
                  class="timer-btn stop-btn"
                  @click="stopTimer"
                >
                  ⏹️ 停止
                </button>
              </div>
              
              <!-- 预设时间 -->
              <div class="preset-times">
                <button 
                  v-for="preset in [5, 10, 15, 25, 30]" 
                  :key="preset"
                  class="preset-btn"
                  :class="{ active: timerDuration === preset * 60 }"
                  @click="handlePresetTime(preset)"
                >
                  {{ preset }}分钟
                </button>
              </div>
            </div>
          </div>
          
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

/* 圆环容器 */
.timer-ring-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.ring-svg {
  width: 100%;
  height: 100%;
}

.ring-background {
  transition: stroke 0.3s ease;
}

.ring-progress {
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 8px currentColor);
}

.time-text {
  font-size: 20px;
  font-weight: bold;
  fill: white;
  font-family: 'Arial', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.mode-text {
  font-size: 12px;
  fill: rgba(255, 255, 255, 0.7);
  font-family: 'Arial', sans-serif;
}

.drag-handle {
  position: absolute;
  width: 24px;
  height: 24px;
  cursor: grab;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.drag-handle:active {
  cursor: grabbing;
}

.handle-dot {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  border: 2px solid #4CAF50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
  transition: all 0.2s ease;
}

.drag-handle:active .handle-dot {
  transform: scale(1.3);
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.7);
}

/* 计时器控制区域 */
.timer-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 模式切换 */
.mode-switch {
  display: flex;
  gap: 10px;
  width: 100%;
}

.mode-btn {
  flex: 1;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.mode-btn.active {
  background: rgba(76, 175, 80, 0.3);
  border-color: #4CAF50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}

.mode-btn.countdown.active {
  background: rgba(33, 150, 243, 0.3);
  border-color: #2196F3;
  box-shadow: 0 0 8px rgba(33, 150, 243, 0.3);
}

/* 无限循环控制 */
.infinite-controls {
  display: flex;
  justify-content: center;
  width: 100%;
}

.infinite-play-btn {
  width: 100%;
  max-width: 200px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
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
  gap: 8px;
}

.infinite-play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.infinite-play-btn.paused {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

/* 倒计时控制 */
.countdown-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.countdown-main-controls {
  display: flex;
  gap: 10px;
  width: 100%;
}

.timer-btn {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.play-pause-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.play-pause-btn.paused {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

.stop-btn {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.timer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.preset-times {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  width: 100%;
}

.preset-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.preset-btn.active {
  background: #2196F3;
  border-color: #2196F3;
  box-shadow: 0 0 8px rgba(33, 150, 243, 0.4);
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
  
  .timer-ring-container {
    width: 150px;
    height: 150px;
  }
  
  .time-text {
    font-size: 16px;
  }
  
  .mode-text {
    font-size: 10px;
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
  
  .timer-controls {
    padding: 15px;
  }
  
  .mode-switch {
    flex-direction: column;
  }
  
  .countdown-main-controls {
    flex-direction: column;
  }
}
</style>