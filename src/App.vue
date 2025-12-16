<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSoundMixer } from './composables/useSoundMixer'
import { useTimer } from './composables/useTimer'
import SoundCard from './components/SoundCard.vue'
import ControlPanel from './components/ControlPanel.vue'
import TimerRing from './components/TimerRing.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

// 初始化音频管理器
const audioManager = useSoundMixer()

// 初始化计时器
const timer = useTimer(audioManager)

// 组件挂载时预加载音频
onMounted(async () => {
  try {
    await audioManager.preloadSounds()
  } catch (err) {
    console.error('音频预加载失败:', err)
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  audioManager.cleanup()
})

// 处理圆环拖动时间设置
const handleTimeChange = (percentage) => {
  timer.setTimerByPercentage(percentage)
}

const handleDragStart = () => {
  // 可以添加拖动开始的效果
}

const handleDragEnd = () => {
  // 可以添加拖动结束的效果
}
</script>

<template>
  <div class="app">
    <LoadingSpinner v-if="audioManager.isLoading" />
    
    <div v-else-if="audioManager.error" class="error-message">
      {{ audioManager.error }}
    </div>

    <div v-else class="sound-mixer">
      <header class="app-header">
        <h1>白噪音混合器</h1>
        
        <!-- 计时器控制区域 -->
        <div class="timer-section">
          <TimerRing
            :timer-mode="timer.timerMode"
            :progress-percentage="timer.progressPercentage"
            :formatted-time-left="timer.formattedTimeLeft"
            :circumference="timer.circumference"
            :stroke-dashoffset="timer.strokeDashoffset"
            @time-change="handleTimeChange"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
          />
          
          <div class="timer-controls">
            <button 
              class="timer-mode-btn"
              :class="{ active: timer.timerMode }"
              @click="timer.toggleTimerMode"
            >
              {{ timer.timerMode ? '计时模式' : '循环模式' }}
            </button>
            
            <div class="timer-buttons">
              <button 
                v-if="!timer.isTimerRunning"
                class="control-btn play"
                @click="timer.startTimer"
              >
                ▶️ 开始
              </button>
              <button 
                v-else
                class="control-btn pause"
                @click="timer.pauseTimer"
              >
                ⏸️ 暂停
              </button>
              
              <button 
                class="control-btn stop"
                @click="timer.stopTimer"
              >
                ⏹️ 停止
              </button>
            </div>
            
            <div class="timer-display">
              <span v-if="timer.timerMode">
                {{ timer.formattedTimeLeft }}
              </span>
              <span v-else>无限循环</span>
            </div>
          </div>
        </div>

        <ControlPanel
          :is-playing="audioManager.isPlaying"
          :global-volume="audioManager.globalVolume"
          @toggle-all="audioManager.toggleAllSounds"
          @volume-change="audioManager.setVolume"
        />
      </header>

      <main class="sound-grid">
        <SoundCard
          v-for="sound in audioManager.sounds"
          :key="sound.id"
          :sound="sound"
          @toggle="audioManager.toggleSound"
          @volume-change="audioManager.setVolume"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.sound-mixer {
  max-width: 1200px;
  margin: 0 auto;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.timer-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.timer-mode-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.timer-mode-btn.active {
  background: rgba(79, 172, 254, 0.3);
  border-color: #4facfe;
}

.timer-buttons {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.control-btn.play {
  background: #4CAF50;
}

.control-btn.pause {
  background: #FF9800;
}

.control-btn.stop {
  background: #F44336;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.timer-display {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
}

.sound-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.error-message {
  background: #ff4757;
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin: 20px;
  font-size: 1.1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app {
    padding: 10px;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .timer-section {
    padding: 15px;
  }
  
  .timer-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .control-btn {
    width: 100%;
  }
  
  .sound-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>